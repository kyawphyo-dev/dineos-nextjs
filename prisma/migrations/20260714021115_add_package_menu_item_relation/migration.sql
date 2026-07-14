-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "_PackageMenuItems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PackageMenuItems_AB_unique" ON "_PackageMenuItems"("A", "B");

-- CreateIndex
CREATE INDEX "_PackageMenuItems_B_index" ON "_PackageMenuItems"("B");

-- AddForeignKey
ALTER TABLE "_PackageMenuItems" ADD CONSTRAINT "_PackageMenuItems_A_fkey" FOREIGN KEY ("A") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PackageMenuItems" ADD CONSTRAINT "_PackageMenuItems_B_fkey" FOREIGN KEY ("B") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
