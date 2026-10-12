import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { User, Tailor, Business, VerificationRequest, AuditLog } from '../server/models.js';

async function runMigration() {
  const isApply = process.argv.includes('--apply');
  console.log(`\n======================================================`);
  console.log(`MeraTailor Legacy Data Audit & Migration Tool`);
  console.log(`Mode: ${isApply ? 'APPLY (Live updates will be committed)' : 'DRY RUN (Simulating changes only)'}`);
  console.log(`======================================================\n`);

  if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI environment variable is missing.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected to database: ${mongoose.connection.name}`);

  // 1. Fetch current raw state
  const [users, tailors, businesses, existingVerRequests] = await Promise.all([
    User.find().lean(),
    Tailor.find().lean(),
    Business.find().lean(),
    VerificationRequest.find().lean(),
  ]);

  console.log(`\nFound: ${users.length} Users, ${tailors.length} Tailors, ${businesses.length} Businesses, ${existingVerRequests.length} VerificationRequests.`);

  // 2. Create Recoverable Backup Snapshot before any mutations
  const backupDir = path.resolve('backup');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const backupFilename = path.join(backupDir, `backup_pre_migration_${Date.now()}.json`);
  fs.writeFileSync(
    backupFilename,
    JSON.stringify({ timestamp: new Date().toISOString(), users, tailors, businesses }, null, 2),
    'utf8'
  );
  console.log(`\n[SAFEGUARD] Full snapshot backed up to:\n  ${backupFilename}`);

  const plannedChanges = [];
  const manualReviewRequired = [];

  // 3. User & Role Audits
  const userByClerkId = new Map();
  const seenClerks = new Set();
  for (const u of users) {
    if (seenClerks.has(u.clerkUserId)) {
      manualReviewRequired.push({
        type: 'DUPLICATE_CLERK_USER',
        identifier: u.clerkUserId,
        recordId: u._id,
        reason: 'Multiple User collection documents exist for same Clerk user ID.',
      });
    } else {
      seenClerks.add(u.clerkUserId);
      userByClerkId.set(u.clerkUserId, u);
    }
  }

  // 4. Tailor Accounts Harmonization
  for (const t of tailors) {
    let needsUpdate = false;
    const updates = {};

    // Canonize verificationStatus
    let canonicalStatus = t.verificationStatus;
    if (!canonicalStatus || !['unverified', 'pending', 'verified', 'rejected', 'resubmission_required', 'suspended'].includes(canonicalStatus)) {
      canonicalStatus = t.verified ? 'verified' : 'unverified';
      updates.verificationStatus = canonicalStatus;
      needsUpdate = true;
    }

    // Ensure verified boolean strictly mirrors verificationStatus === 'verified'
    const expectedVerified = canonicalStatus === 'verified';
    if (Boolean(t.verified) !== expectedVerified) {
      updates.verified = expectedVerified;
      needsUpdate = true;
    }

    // If demo flag exists on real studio
    if (t.isDemo && t.ownerClerkUserId) {
      updates.isDemo = false;
      needsUpdate = true;
    }

    if (needsUpdate) {
      plannedChanges.push({
        collection: 'Tailor',
        id: t._id,
        name: t.name,
        ownerClerkUserId: t.ownerClerkUserId,
        updates,
        reason: 'Harmonize tailor verificationStatus enum and strict verified boolean matching.',
      });

      if (isApply) {
        await Tailor.updateOne({ _id: t._id }, { $set: updates });
      }
    }

    // Sync or create authoritative VerificationRequest if tailor is verified or pending
    if (canonicalStatus === 'verified' || canonicalStatus === 'pending') {
      const existingReq = existingVerRequests.find(r => r.targetType === 'tailor' && String(r.targetId) === String(t._id));
      if (!existingReq && isApply) {
        await VerificationRequest.create({
          targetType: 'tailor',
          targetId: t._id,
          clerkUserId: t.ownerClerkUserId || 'legacy_unassigned',
          name: t.name,
          companyName: t.name,
          phone: t.phone || '',
          city: t.city || 'Jaipur',
          status: canonicalStatus,
          submittedAt: t.verificationAppliedAt || t.createdAt || new Date(),
          reviewedAt: canonicalStatus === 'verified' ? (t.verifiedAt || t.updatedAt || new Date()) : undefined,
          reviewedBy: t.verifiedBy || undefined,
          reviewDecision: canonicalStatus === 'verified' ? 'approved' : undefined,
          history: [
            {
              action: canonicalStatus === 'verified' ? 'APPROVED' : 'SUBMITTED',
              status: canonicalStatus,
              actorClerkUserId: t.verifiedBy || t.ownerClerkUserId || 'system',
              reason: canonicalStatus === 'verified' ? 'Verified atelier migration sync' : 'Pending review',
              timestamp: new Date(),
            },
          ],
        });
        console.log(`[VERIFICATION_REQUEST] Created request for Tailor [${t._id}] "${t.name}" (${canonicalStatus})`);
      }
    }
  }

  // 5. Business Accounts Harmonization
  const businessByOwner = new Map();
  for (const b of businesses) {
    businessByOwner.set(b.ownerClerkUserId, b);
    let needsUpdate = false;
    const updates = {};

    let canonicalStatus = b.verificationStatus;
    if (!canonicalStatus || !['unverified', 'pending', 'verified', 'rejected', 'resubmission_required', 'suspended'].includes(canonicalStatus)) {
      canonicalStatus = b.verified ? 'verified' : 'unverified';
      updates.verificationStatus = canonicalStatus;
      needsUpdate = true;
    }

    const expectedVerified = canonicalStatus === 'verified';
    if (Boolean(b.verified) !== expectedVerified) {
      updates.verified = expectedVerified;
      needsUpdate = true;
    }

    if (needsUpdate) {
      plannedChanges.push({
        collection: 'Business',
        id: b._id,
        name: b.companyName,
        ownerClerkUserId: b.ownerClerkUserId,
        updates,
        reason: 'Harmonize business verificationStatus enum and strict verified boolean.',
      });

      if (isApply) {
        await Business.updateOne({ _id: b._id }, { $set: updates });
      }
    }
  }

  // 6. Ensure Users with role='business' have authoritative Business document and synced profile
  for (const u of users) {
    if (u.role === 'business') {
      const existingBiz = businessByOwner.get(u.clerkUserId);
      if (!existingBiz) {
        const companyName = u.businessProfile?.companyName || `${u.firstName || 'Enterprise'}'s Studio`;
        plannedChanges.push({
          collection: 'Business',
          id: 'NEW_RECORD',
          ownerClerkUserId: u.clerkUserId,
          updates: {
            ownerClerkUserId: u.clerkUserId,
            companyName,
            verificationStatus: 'unverified',
            verified: false,
          },
          reason: `User ${u.clerkUserId} has role='business' but had no Business collection document. Creating one.`,
        });

        if (isApply) {
          const createdBiz = await Business.create({
            ownerClerkUserId: u.clerkUserId,
            companyName,
            gstin: u.businessProfile?.gstin || '',
            businessType: u.businessProfile?.businessType || 'Corporate Enterprise',
            panNumber: u.businessProfile?.panNumber || '',
            website: u.businessProfile?.website || '',
            address: u.businessProfile?.address || '',
            city: u.businessProfile?.city || 'Jaipur',
            state: u.businessProfile?.state || 'Rajasthan',
            pincode: u.businessProfile?.pincode || '',
            contactPerson: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Business Representative',
            contactPhone: u.phone || '',
            verificationStatus: 'unverified',
            verified: false,
          });

          // Sync user.businessProfile
          await User.updateOne(
            { _id: u._id },
            {
              $set: {
                businessProfile: {
                  companyName,
                  verificationStatus: 'unverified',
                  verified: false,
                },
              },
            }
          );
          console.log(`[BUSINESS_SYNC] Created missing Business document for user ${u.clerkUserId}: ${createdBiz._id}`);
        }
      }
    }
  }

  // 7. Audit Results & Reporting
  console.log(`\n=== MIGRATION AUDIT REPORT ===`);
  console.log(`Total Planned/Applied Fixes: ${plannedChanges.length}`);
  plannedChanges.forEach((c, idx) => {
    console.log(`  [${idx + 1}] Collection: ${c.collection} | ID: ${c.id} | Updates: ${JSON.stringify(c.updates)} | Reason: ${c.reason}`);
  });

  if (manualReviewRequired.length > 0) {
    console.log(`\n=== RECORDS REQUIRING MANUAL REVIEW (${manualReviewRequired.length}) ===`);
    manualReviewRequired.forEach((r, idx) => {
      console.log(`  [${idx + 1}] Type: ${r.type} | ID: ${r.identifier} | Record: ${r.recordId} | Reason: ${r.reason}`);
    });
  } else {
    console.log(`\nNo ambiguous conflicts requiring manual intervention found.`);
  }

  if (!isApply) {
    console.log(`\n[DRY RUN COMPLETE] Zero database records were modified.`);
    console.log(`To commit these changes, run: node scripts/migrate_legacy_data.js --apply\n`);
  } else {
    console.log(`\n[APPLY COMPLETE] Database updates committed successfully.\n`);
  }

  await mongoose.disconnect();
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
