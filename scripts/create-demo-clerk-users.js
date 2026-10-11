import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { clerkClient } from '@clerk/express';

if (!process.env.CLERK_SECRET_KEY) throw new Error('Set CLERK_SECRET_KEY in .env before creating demo accounts.');
const roles = ['customer', 'tailor', 'business', 'admin'];
const created = [];
for (const role of roles) {
  const email = `demo+${role}@example.test`;
  const password = `Mt-${randomBytes(18).toString('base64url')}!9`;
  const user = await clerkClient.users.createUser({
    emailAddress: [email],
    emailAddressIdentificationStatus: ['verified'],
    password,
    firstName: `Demo ${role[0].toUpperCase()}${role.slice(1)}`,
    lastName: 'Account',
    publicMetadata: { appRole: role },
  });
  created.push({ role, email, password, clerkUserId: user.id });
}
const filePath = new URL('../.demo-credentials.json', import.meta.url);
await writeFile(filePath, `${JSON.stringify({ warning: 'Local test credentials only. Rotate or delete these Clerk test users before deployment.', accounts: created }, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
console.log(`Created ${created.length} Clerk test accounts. Credentials were written to .demo-credentials.json (gitignored).`);
