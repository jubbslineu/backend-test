/*
  Warnings:

  - You are about to drop the column `tonWalletAddress` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "tonWalletAddress",
ADD COLUMN     "walletAddress" TEXT;
