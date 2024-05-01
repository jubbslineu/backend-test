import type { Sale } from '@/lib/prisma';

export interface SaleResponseObject
  extends Omit<Omit<Sale, 'initialPrice'>, 'priceIncrement'> {
  initialPrice: string;
  priceIncrement: string[];
}

export interface SaleExtended extends SaleResponseObject {
  currentPhase?: number;
  lowerTokenLimit?: number;
  upperTokenLimit?: number;
  currentPrice?: string;
  tokensForSale?: number;
  remainingTokens?: number;
  remainingPhaseTokens?: number;
}

export interface CreateCryptoPaymentResponse {
  paymentUrl: string;
}

export interface GenerateTonPaymentCodeResponse {
  paymentCode: string;
}

export interface EditReceivingAddressResponse {
  saleName: string;
  telegramId: string;
  receivingAddress: string;
}
