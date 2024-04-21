-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TON');

-- CreateEnum
CREATE TYPE "PaymentRequestStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "pendingOrderAmount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PaymentRequest" (
    "telegramId" TEXT NOT NULL,
    "saleName" TEXT NOT NULL,
    "seqNo" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "status" "PaymentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "destination" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("telegramId","saleName","seqNo")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequest_code_key" ON "PaymentRequest"("code");

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "User"("telegramId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_saleName_fkey" FOREIGN KEY ("saleName") REFERENCES "Sale"("name") ON DELETE CASCADE ON UPDATE CASCADE;
