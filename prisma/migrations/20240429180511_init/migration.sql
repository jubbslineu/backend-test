-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "isReceivingAddressEditable" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tonWalletAddress" TEXT;

-- CreateTable
CREATE TABLE "MerkleEntry" (
    "telegramId" TEXT NOT NULL,
    "saleName" TEXT NOT NULL,
    "address" TEXT,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "MerkleEntry_pkey" PRIMARY KEY ("telegramId","saleName")
);

-- AddForeignKey
ALTER TABLE "MerkleEntry" ADD CONSTRAINT "MerkleEntry_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "User"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerkleEntry" ADD CONSTRAINT "MerkleEntry_saleName_fkey" FOREIGN KEY ("saleName") REFERENCES "Sale"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
