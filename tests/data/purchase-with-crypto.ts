import { randomUUID } from 'crypto';
import { UserRole } from '../../src/lib/prisma';
import { createPaymentCodeSync } from '../e2e/utils/common';

export const seedAdminData = {
  telegramId: '111111110',
  role: UserRole.ADMIN,
};

export const buyerUserData = {
  telegramId: '111111111',
  role: UserRole.REGULAR,
  referrerId: seedAdminData.telegramId,
};

export const startNewSaleBody = {
  name: 'test-sale',
  phases: 3,
  tokensPerPhase: [1000, 1500, 2000],
  initialPrice: '10.00',
  priceIncrement: ['10.00', '5.00'],
};

export const adminAuthenticateBody = {
  user: seedAdminData.telegramId,
};

export const buyerAuthenticateBody = {
  user: buyerUserData.telegramId,
};

export const purchaseWithCryptoBody = {
  amount: Math.floor(Math.random() * startNewSaleBody.tokensPerPhase[0]),
};

export const changellyCreatePaymentMockResponse = {
  data: {
    payment_url: 'https://test-payment-url.com',
  },
};

export const changellyCreateCallbackMockResponse = {
  status: 204,
};

export const cryptoCallbackBody = {
  payment_id: randomUUID(),
  customer_id: buyerUserData.telegramId,
  order_id: createPaymentCodeSync(
    buyerUserData.telegramId,
    startNewSaleBody.name,
    0
  ),
  state: 'COMPLETED',
  updated_at: new Date().toISOString(),
};
