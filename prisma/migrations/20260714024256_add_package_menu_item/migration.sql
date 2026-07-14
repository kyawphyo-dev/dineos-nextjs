/*
  Warnings:

  - You are about to drop the `_PackageMenuItems` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PackageMenuItems" DROP CONSTRAINT "_PackageMenuItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_PackageMenuItems" DROP CONSTRAINT "_PackageMenuItems_B_fkey";

-- DropTable
DROP TABLE "_PackageMenuItems";

-- CreateTable
CREATE TABLE "PackageMenuItem" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageMenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PackageMenuItem_packageId_menuItemId_key" ON "PackageMenuItem"("packageId", "menuItemId");

-- AddForeignKey
ALTER TABLE "PackageMenuItem" ADD CONSTRAINT "PackageMenuItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageMenuItem" ADD CONSTRAINT "PackageMenuItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
