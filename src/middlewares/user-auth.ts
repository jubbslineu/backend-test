import { type NextFunction, type Response } from 'express';
import type { RequestWithUser } from '@/types/extended-request.type';
import { HttpBadRequestError } from '@/lib/errors';
import { decodeJwt } from '@/utils/jwt';
import prisma from '@/lib/prisma';

const verifyUserToken = async (
  roles: string[],
  req: RequestWithUser,
  _res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    next(
      new HttpBadRequestError('Invalid user token', ['No authorization header'])
    );
  }

  try {
    const tokenInfo = decodeJwt(
      req.headers.authorization!.replace(/^Bearer\s+/, '')
    );

    const user = await prisma.user.findUnique({
      where: { telegramId: tokenInfo.id },
    });

    if (!user) {
      next(
        new HttpBadRequestError('Invalid user token', ['User not registered'])
      );

      return;
    }

    if (roles.includes(user.role.toString())) {
      next(
        new HttpBadRequestError('Invalid user token', [
          `User does not have any of the following roles [${roles.join(', ')}]`,
        ])
      );
    }

    req.user = user;
    next();
  } catch (e) {
    next(new HttpBadRequestError('Invalid user token', [e.message]));
  }
};

export const verifyRegularUserToken = verifyUserToken.bind([
  'REGULAR',
  'ADMIN',
]);
export const verifyAdminUsertoken = verifyUserToken.bind('ADMIN');
