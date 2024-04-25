/*
  Warnings:

  - The primary key for the `Purchase` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `referralLevel` to the `Reward` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'CHANGELLY_CRYPTO';
ALTER TYPE "PaymentMethod" ADD VALUE 'CHANGELLY_FIAT';

-- AlterEnum
ALTER TYPE "PaymentRequestStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "Purchase" DROP CONSTRAINT "Purchase_pkey",
ADD CONSTRAINT "Purchase_pkey" PRIMARY KEY ("telegramId", "saleName", "createdAt");

-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "referralLevel" INTEGER NOT NULL;
