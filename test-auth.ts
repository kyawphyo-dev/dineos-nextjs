import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Testing authentication...\n");

  // Test password login
  const testEmail = "anan@dineos.app";
  const testPassword = "owner123";
  
  console.log(`Testing password login for ${testEmail}...`);
  const userByEmail = await prisma.user.findUnique({
    where: { email: testEmail },
  });
  
  if (userByEmail) {
    const passwordValid = await bcrypt.compare(testPassword, userByEmail.hashedPassword);
    console.log(`Password valid: ${passwordValid}\n`);
  } else {
    console.log("User not found by email\n");
  }

  // Test PIN login
  const testUsername = "anan";
  const testPin = "1111";
  
  console.log(`Testing PIN login for ${testUsername}...`);
  const userByUsername = await prisma.user.findUnique({
    where: { username: testUsername },
  });
  
  if (userByUsername) {
    const pinValid = await bcrypt.compare(testPin, userByUsername.hashedPin);
    console.log(`PIN valid: ${pinValid}\n`);
  } else {
    console.log("User not found by username\n");
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
