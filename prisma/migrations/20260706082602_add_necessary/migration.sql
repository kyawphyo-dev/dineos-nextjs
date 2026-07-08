/*
  Warnings:

  - You are about to drop the column `session` on the `Table` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "menuStatus" AS ENUM ('available', 'soldOut');

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "status" "menuStatus" NOT NULL DEFAULT 'available';

-- AlterTable
ALTER TABLE "Table" DROP COLUMN "session",
ALTER COLUMN "qr" DROP NOT NULL;
