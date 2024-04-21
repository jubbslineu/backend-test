import LogMessage from '@/decorators/log-message.decorator';
import { HttpBadRequestError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { signJwt, decodeJwt, JwtDecodeErrorReason } from '@/utils/jwt';

interface AuthenticatePayload {
  user: string;
  referrer?: string;
}

export default class UserService {
  public async verifyUserToken(
    token: string,
    userId?: string
  ): Promise<string> {
    try {
      let telegramId: string;
      try {
        const tokenInfo = decodeJwt(token);
        telegramId = tokenInfo.id;
      } catch (e) {
        if (e.reason === JwtDecodeErrorReason.EXPIRED && userId) {
          telegramId = userId;
        } else {
          throw new HttpBadRequestError('Authentication Failed', [
            'Token expired',
            'User ID not provided for JWT renewal',
            e.message,
          ]);
        }
      }
      const user = await prisma.user.findUnique({
        where: { telegramId },
      });

      if (!user) {
        throw new HttpBadRequestError('Authentication Failed', [
          'Invalid user JWT',
          'User not registered',
        ]);
      }

      if (userId && userId !== user.telegramId) {
        throw new HttpBadRequestError('Authentication Failed', [
          "Provided user and JWT doesn't match",
        ]);
      }

      return signJwt(telegramId);
    } catch (e) {
      throw new HttpBadRequestError('Authentication Failed', [
        'Invalid user JWT',
        e.message,
      ]);
    }
  }

  public async createUserJwt(userId: string | number): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { telegramId: String(userId) },
    });

    if (!user) {
      throw new HttpBadRequestError('Authentication Failed', [
        'User ID not found',
      ]);
    }

    return signJwt(String(userId));
  }

  @LogMessage<[AuthenticatePayload]>({ message: 'test-decorator' })
  public async createUserRecordAndJWT(
    data: AuthenticatePayload
  ): Promise<{ jwt: string; created: boolean }> {
    const [existingUser, referrer] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { telegramId: String(data.user) },
      }),
      prisma.user.findUnique({
        where: { telegramId: String(data.referrer) },
      }),
    ]);

    if (!existingUser) {
      if (!referrer) {
        throw new HttpBadRequestError('Authentication Failed', [
          'Referrer not registered',
        ]);
      }

      const user = await prisma.user.create({
        data: {
          telegramId: String(data.user),
          referrerId: referrer.telegramId,
        },
      });

      return {
        jwt: signJwt(user.telegramId),
        created: true,
      };
    }

    return {
      jwt: signJwt(existingUser.telegramId),
      created: false,
    };
  }
}
