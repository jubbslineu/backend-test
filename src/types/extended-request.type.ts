import type { Request } from 'express';
import type { User } from '@/lib/prisma';

export interface RequestWithUser extends Request {
  user: User;
}
