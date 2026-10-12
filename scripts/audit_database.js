import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { User, Tailor, Business, Order, BusinessRequest, AuditLog, Notification } from '../server/models.js';

async function audit() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing in environment.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected to MongoDB: ${mongoose.connection.name}`);

  const [users, tailors, businesses, orders, bulkReqs, auditLogs, notifs] = await Promise.all([
    User.find().lean(),
    Tailor.find().lean(),
    Business.find().lean(),
    Order.find().lean(),
    BusinessRequest.find().lean(),
    AuditLog.find().lean(),
    Notification.find().lean(),
  ]);

  console.log('\n=== REAL DATABASE RECORD COUNTS ===');
  console.log(`Users: ${users.length}`);
  console.log(`Tailor Profiles: ${tailors.length}`);
  console.log(`Business Profiles: ${businesses.length}`);
  console.log(`Orders: ${orders.length}`);
  console.log(`Business Requests (RFQs): ${bulkReqs.length}`);
  console.log(`Audit Logs: ${auditLogs.length}`);
  console.log(`Notifications: ${notifs.length}`);

  // 1. Role distribution
  const roles = {};
  users.forEach(u => {
    roles[u.role] = (roles[u.role] || 0) + 1;
  });
  console.log('\n=== USER ROLES DISTRIBUTION ===', roles);

  // 2. Duplicate Check for Users
  const userByClerk = new Map();
  const dupUsers = [];
  users.forEach(u => {
    if (userByClerk.has(u.clerkUserId)) {
      dupUsers.push({ clerkUserId: u.clerkUserId, id1: userByClerk.get(u.clerkUserId)._id, id2: u._id });
    } else {
      userByClerk.set(u.clerkUserId, u);
    }
  });
  console.log(`Duplicate User records by clerkUserId: ${dupUsers.length}`, dupUsers);

  // 3. Tailors Inconsistencies
  console.log('\n=== TAILOR ATELIERS AUDIT ===');
  const tailorByOwner = new Map();
  const duplicateTailors = [];
  const statusMismatchesTailor = [];
  const orphanedTailors = [];

  tailors.forEach(t => {
    // Duplicate owner check
    if (t.ownerClerkUserId) {
      if (tailorByOwner.has(t.ownerClerkUserId)) {
        duplicateTailors.push({ ownerClerkUserId: t.ownerClerkUserId, first: tailorByOwner.get(t.ownerClerkUserId)._id, duplicate: t._id });
      } else {
        tailorByOwner.set(t.ownerClerkUserId, t);
      }

      // Check if user exists
      const user = userByClerk.get(t.ownerClerkUserId);
      if (!user) {
        orphanedTailors.push({ tailorId: t._id, name: t.name, ownerClerkUserId: t.ownerClerkUserId });
      }
    }

    // Status / boolean verified mismatch
    if (t.verified && t.verificationStatus !== 'verified') {
      statusMismatchesTailor.push({ id: t._id, name: t.name, verified: t.verified, status: t.verificationStatus });
    } else if (!t.verified && t.verificationStatus === 'verified') {
      statusMismatchesTailor.push({ id: t._id, name: t.name, verified: t.verified, status: t.verificationStatus });
    }
  });

  console.log(`Duplicate Tailors by ownerClerkUserId: ${duplicateTailors.length}`, duplicateTailors);
  console.log(`Tailor verified boolean vs verificationStatus mismatches: ${statusMismatchesTailor.length}`, statusMismatchesTailor);
  console.log(`Orphaned Tailors (no matching User record): ${orphanedTailors.length}`, orphanedTailors);

  // List all tailors
  tailors.forEach(t => {
    console.log(`  - Tailor: [${t._id}] "${t.name}" | owner=${t.ownerClerkUserId} | verified=${t.verified} | status=${t.verificationStatus} | isDemo=${t.isDemo}`);
  });

  // 4. Business Inconsistencies
  console.log('\n=== BUSINESS AUDIT ===');
  const businessByOwner = new Map();
  const duplicateBusinesses = [];
  const statusMismatchesBusiness = [];
  const orphanedBusinesses = [];

  businesses.forEach(b => {
    if (b.ownerClerkUserId) {
      if (businessByOwner.has(b.ownerClerkUserId)) {
        duplicateBusinesses.push({ ownerClerkUserId: b.ownerClerkUserId, first: businessByOwner.get(b.ownerClerkUserId)._id, duplicate: b._id });
      } else {
        businessByOwner.set(b.ownerClerkUserId, b);
      }

      const user = userByClerk.get(b.ownerClerkUserId);
      if (!user) {
        orphanedBusinesses.push({ businessId: b._id, company: b.companyName, ownerClerkUserId: b.ownerClerkUserId });
      }
    }

    if (b.verified && b.verificationStatus !== 'verified') {
      statusMismatchesBusiness.push({ id: b._id, company: b.companyName, verified: b.verified, status: b.verificationStatus });
    } else if (!b.verified && b.verificationStatus === 'verified') {
      statusMismatchesBusiness.push({ id: b._id, company: b.companyName, verified: b.verified, status: b.verificationStatus });
    }
  });

  console.log(`Duplicate Businesses by ownerClerkUserId: ${duplicateBusinesses.length}`, duplicateBusinesses);
  console.log(`Business verified boolean vs verificationStatus mismatches: ${statusMismatchesBusiness.length}`, statusMismatchesBusiness);
  console.log(`Orphaned Businesses: ${orphanedBusinesses.length}`, orphanedBusinesses);

  businesses.forEach(b => {
    console.log(`  - Business: [${b._id}] "${b.companyName}" | owner=${b.ownerClerkUserId} | verified=${b.verified} | status=${b.verificationStatus} | gstin=${b.gstin}`);
  });

  // 5. User businessProfile vs Business collection sync
  console.log('\n=== USER businessProfile vs BUSINESS COLLECTION SYNC ===');
  users.forEach(u => {
    if (u.role === 'business' || u.businessProfile?.companyName || u.businessProfile?.verificationStatus) {
      const bDoc = businessByOwner.get(u.clerkUserId);
      const bProf = u.businessProfile || {};
      const statusConflict = bDoc && bDoc.verificationStatus !== bProf.verificationStatus;
      console.log(`  - User [${u.clerkUserId}] role=${u.role} | User.businessProfile.status=${bProf.verificationStatus} | Business.status=${bDoc?.verificationStatus || 'NO_DOC'} | conflict=${Boolean(statusConflict)}`);
    }
  });

  await mongoose.disconnect();
}

audit().catch(console.error);
