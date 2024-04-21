-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('REGULAR', 'ADMIN');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('ON_SALE', 'PAUSED', 'CANCELLED', 'SOLD_OUT');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('APPROVED', 'PENDING', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "telegramId" TEXT NOT NULL,
    "referrerId" TEXT,
    "referralRewardLevelRates" DOUBLE PRECISION[] DEFAULT ARRAY[0.08, 0.04, 0.02]::DOUBLE PRECISION[],
    "username" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'REGULAR',

    CONSTRAINT "User_pkey" PRIMARY KEY ("telegramId")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "telegramId" TEXT NOT NULL,
    "telegramUsername" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "emailAddress" TEXT,
    "indicative" TEXT,
    "phoneNumber" TEXT,
    "cityOfResidency" TEXT,
    "homeAddress" TEXT,
    "personalInterests" TEXT,
    "artisticInterests" TEXT,
    "investmentInterests" TEXT,
    "occupation" TEXT,
    "position" TEXT,
    "industry" TEXT,
    "joiningReasons" TEXT,
    "discoveryMethod" TEXT,
    "expectations" TEXT,
    "contribution" TEXT,
    "engagement" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("telegramId")
);

-- CreateTable
CREATE TABLE "Sale" (
    "name" TEXT NOT NULL,
    "status" "SaleStatus" NOT NULL,
    "phases" INTEGER NOT NULL,
    "tokensPerPhase" INTEGER[],
    "initialPrice" MONEY NOT NULL,
    "priceIncrement" MONEY[],
    "start" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "end" TIMESTAMP(3),
    "pausedTime" INTEGER NOT NULL DEFAULT 0,
    "totalSold" INTEGER NOT NULL DEFAULT 0,
    "totalRewards" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pausedAt" TIMESTAMP(3),

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "telegramId" TEXT NOT NULL,
    "saleName" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("telegramId","saleName")
);

-- CreateTable
CREATE TABLE "Reward" (
    "telegramId" TEXT NOT NULL,
    "saleName" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("telegramId","saleName","refereeId","createdAt")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("telegramId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "User"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "User"("telegramId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_saleName_fkey" FOREIGN KEY ("saleName") REFERENCES "Sale"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_telegramId_fkey" FOREIGN KEY ("telegramId") REFERENCES "User"("telegramId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "User"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_saleName_fkey" FOREIGN KEY ("saleName") REFERENCES "Sale"("name") ON DELETE CASCADE ON UPDATE CASCADE;
