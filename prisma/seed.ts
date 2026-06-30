// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create required records first (Company, Restaurant, Branch)

  const company = await prisma.company.create({
    data: {
      name: "DineOS Company",
    },
  });
  const owner = await prisma.owner.create({
    data: {
      name: "Khun Anan",
      email: "anan@dineos.app",
      username: "anan",
      hashedPassword: await bcrypt.hash("owner123", 10),
      hashedPin: await bcrypt.hash("1111", 10),
      role: "owner",
      companyId: company.id,
      subscription: "free",
    },
  });

  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Baan Rim Naam Thai Kitchen",
      companyId: company.id,
      ownerId: owner.id,
    },
  });

  const branch = await prisma.branch.create({
    data: {
      name: "Main Branch",
      location: "Bangkok",
      ownerId: owner.id,
      restaurantId: restaurant.id,
    },
  });

  const zone = await prisma.zone.create({
    data: {
      name: "Floor 1",
      branchId: branch.id,
    },
  });

  await prisma.staff.createMany({
    data: [
      {
        name: "Khun Kyaw",
        email: "manager@dineos.app",
        username: "Kyaw",
        hashedPassword: await bcrypt.hash("manager123", 10),
        hashedPin: await bcrypt.hash("1111", 10),
        role: "manager",
        branchId: branch.id,
        restaurantId: restaurant.id,
        zoneId: zone.id,
      },
      {
        name: "Khun Phyo",
        email: "cashier@dineos.app",
        username: "Phyo",
        hashedPassword: await bcrypt.hash("cashier123", 10),
        hashedPin: await bcrypt.hash("1111", 10),
        role: "cashier",
        branchId: branch.id,
        restaurantId: restaurant.id,
        zoneId: zone.id,
      },
      {
        name: "Khun Win",
        email: "win@dineos.app",
        username: "win",
        hashedPassword: await bcrypt.hash("kitchen123", 10),
        hashedPin: await bcrypt.hash("1111", 10),
        role: "kitchen",
        branchId: branch.id,
        restaurantId: restaurant.id,
        zoneId: zone.id,
      },
      {
        name: "Khun Cake",
        email: "frontstaff@dineos.app",
        username: "cake",
        hashedPassword: await bcrypt.hash("frontstaff123", 10),
        hashedPin: await bcrypt.hash("1111", 10),
        role: "front_staff",
        branchId: branch.id,
        restaurantId: restaurant.id,
        zoneId: zone.id,
      },
    ],
  });
}

main().finally(() => prisma.$disconnect());
