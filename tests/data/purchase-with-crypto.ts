import { UserRole } from '../../src/lib/prisma';

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
