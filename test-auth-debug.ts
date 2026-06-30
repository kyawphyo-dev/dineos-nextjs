import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Testing Auth System ===\n");

  // Test 1: Check if owner exists
  console.log("1. Checking Owner records...");
  const owners = await prisma.owner.findMany();
  console.log(`   Found ${owners.length} owner(s):`);
  owners.forEach(o => console.log(`   - ${o.name} (${o.email}, ${o.username})`));

  // Test 2: Check if staff exists
  console.log("\n2. Checking Staff records...");
  const staff = await prisma.staff.findMany();
  console.log(`   Found ${staff.length} staff member(s):`);
  staff.forEach(s => console.log(`   - ${s.name} (${s.email}, ${s.username})`));

  // Test 3: Test password check for owner
  console.log("\n3. Testing Owner password check...");
  if (owners.length > 0) {
    const owner = owners[0];
    console.log(`   Testing owner: ${owner.email}`);
    const passwordMatch = await bcrypt.compare("owner123", owner.hashedPassword);
    console.log(`   Password match: ${passwordMatch}`);
    const pinMatch = await bcrypt.compare("1111", owner.hashedPin);
    console.log(`   PIN match: ${pinMatch}`);
  }

  // Test 4: Test password check for staff
  console.log("\n4. Testing Staff password check...");
  if (staff.length > 0) {
    const staffMember = staff[0];
    console.log(`   Testing staff: ${staffMember.email}`);
    const passwordMatch = await bcrypt.compare("manager123", staffMember.hashedPassword);
    console.log(`   Password match: ${passwordMatch}`);
    const pinMatch = await bcrypt.compare("1111", staffMember.hashedPin);
    console.log(`   PIN match: ${pinMatch}`);
  }

  console.log("\n=== Test Complete ===");
}

main().finally(() => prisma.$disconnect());
