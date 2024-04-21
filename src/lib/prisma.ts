import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export {
  SaleStatus,
  UserRole,
  PaymentRequestStatus,
  PaymentMethod,
} from '@prisma/client';
export type { User } from '@prisma/client';
export { Decimal } from '@prisma/client/runtime/library';
export default prisma;
