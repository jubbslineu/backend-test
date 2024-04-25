import type { Request } from 'express';
import type { User } from '@/lib/prisma';
import type {
  ChangellyCryptoPaymentCallbackBody,
  ChangellyFiatPaymentCallbackBody,
} from '@/types/changelly-api.type';

export interface RequestWithUser extends Request {
  user: User;
}

export interface CryptoCallbackRequest extends Request {
  body: ChangellyCryptoPaymentCallbackBody;
}

export interface FiatCallbackRequest extends Request {
  body: ChangellyFiatPaymentCallbackBody;
}
