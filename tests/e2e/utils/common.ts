import { createHash } from 'crypto';
import prismaClient, { Decimal } from '../../../src/lib/prisma';
import type { Sale } from '../../../src/lib/prisma';

interface PhaseStats {
  phase: number;
  lowerLimit: number;
  upperLimit: number;
}

export const createPaymentCodeSync = (
  telegramId: string,
  saleName: string,
  seqNo: number
): string => {
  return createHash('sha256')
    .update(
      JSON.stringify({
        telegramId,
        saleName,
        seqNo,
      })
    )
    .digest('base64');
};

export const createPaymentCodeAsync = async (
  telegramId: string,
  saleName: string
): Promise<string> => {
  return createHash('sha256')
    .update(
      JSON.stringify({
        telegramId,
        saleName,
        seqNo: await getPaymentRequestSeqNo(telegramId, saleName),
      })
    )
    .digest('base64');
};

export const getPaymentRequestSeqNo = async (
  telegramId: string,
  saleName: string
): Promise<number> => {
  return await prismaClient.paymentRequest.count({
    where: {
      telegramId,
      saleName,
    },
  });
};

export const calculateOrderTotalPrice = async (
  saleName: string,
  amount: number
): Promise<Decimal> => {
  const sale = await getSale(saleName);

  const phaseStats = _getPhaseStats(sale);
  let { phase: currentPhase, upperLimit } = phaseStats;

  let tokenPrice = _calculateTokenprice(sale, phaseStats);

  let totalPrice = new Decimal(0);
  let totalLocked = sale.totalSold + sale.pendingOrderAmount;
  while (totalLocked + amount > upperLimit) {
    if (currentPhase >= sale.phases) {
      throw new Error('Final phase reached');
    }
    const remainingPhaseAmount = upperLimit - totalLocked;
    totalPrice = totalPrice.add(tokenPrice.mul(remainingPhaseAmount));
    amount -= remainingPhaseAmount;
    totalLocked = upperLimit;
    currentPhase++;
    upperLimit = upperLimit + sale.tokensPerPhase[currentPhase - 1];
    tokenPrice = tokenPrice.add(sale.priceIncrement[currentPhase - 2]);
  }

  return totalPrice.add(tokenPrice.mul(amount));
};

export const calculateTokenPrice = async (
  saleName: string
): Promise<Decimal> => {
  const sale = await getSale(saleName);
  const phaseStats = _getPhaseStats(sale);

  return _calculateTokenprice(sale, phaseStats);
};

export const getSalePhase = async (saleName: string): Promise<PhaseStats> => {
  const sale = await getSale(saleName);

  return _getPhaseStats(sale);
};

export const getSale = async (saleName: string): Promise<Sale> => {
  const sale = await prismaClient.sale.findUnique({
    where: {
      name: saleName,
    },
  });

  if (!sale) {
    throw new Error(`Sale with name ${saleName} not found.`);
  }

  return sale;
};

const _calculateTokenprice = (sale: Sale, phaseStats: PhaseStats): Decimal => {
  return sale.initialPrice.add(
    sale.priceIncrement
      .slice(0, phaseStats.phase - 1)
      .reduce((sum, curr) => sum.add(curr), new Decimal(0))
  );
};

const _getPhaseStats = (sale: Sale): PhaseStats => {
  const totalLocked = sale.totalSold + sale.pendingOrderAmount;

  let currentPhase = 0;
  const upperLimit = sale.tokensPerPhase
    .slice(0)
    .reduce((phaseTokenLowerbound, tokenPhaseIncrement, phase, arr) => {
      const phaseTokenUpperbound = phaseTokenLowerbound + tokenPhaseIncrement;

      if (phase > sale.phases || totalLocked <= phaseTokenUpperbound) {
        arr.splice(1);
        currentPhase = phase;
      }

      return phaseTokenUpperbound;
    });

  return {
    phase: currentPhase,
    lowerLimit: upperLimit - sale.tokensPerPhase[currentPhase - 1],
    upperLimit,
  };
};
