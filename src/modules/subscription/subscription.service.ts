import { type Subscription } from '@prisma/client';
import LogMessage from '@/decorators/log-message.decorator';
import { HttpBadRequestError } from '@/lib/errors';
import prisma from '@/lib/prisma';
import { signJwt } from '@/utils/jwt';

export default class SubscriptionService {
  @LogMessage({ message: 'get-subscription' })
  public async getSubscriptionByTelegramId(
    telegramId: string
  ): Promise<Subscription | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { telegramId },
    });

    return subscription;
  }

  @LogMessage<[Subscription]>({ message: 'create-subscription' })
  public async createSubscriptionRecord(
    data: Subscription
  ): Promise<{ jwt: string; created: boolean }> {
    const [existingSubscription, existingUser] = await prisma.$transaction([
      prisma.subscription.findUnique({
        where: { telegramId: String(data.telegramId) },
      }),
      prisma.user.findUnique({
        where: { telegramId: String(data.telegramId) },
      }),
    ]);

    // the schema does not allow creating a new subscription without having a user with the same telegramId
    // so we need to create a user first or change the schema to allow creating a subscription without a user
    if (!existingUser) {
      await prisma.user.create({
        data: {
          telegramId: String(data.telegramId),
        },
      });
    }

    if (!existingSubscription) {
      const subscription = await prisma.subscription.create({
        data: {
          ...data,
          telegramId: String(data.telegramId),
          dateOfBirth: data.dateOfBirth
            ? new Date(data.dateOfBirth).toISOString()
            : null,
        },
      });

      return {
        jwt: signJwt(subscription.telegramId),
        created: true,
      };
    }

    return {
      jwt: signJwt(existingSubscription.telegramId),
      created: false,
    };
  }

  @LogMessage<[Partial<Subscription>]>({ message: 'update-subscription' })
  public async updateSubscription({
    telegramId,
    ...data
  }: Partial<Subscription>): Promise<Subscription> {
    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        telegramId: String(telegramId),
      },
    });

    if (!existingSubscription) {
      throw new HttpBadRequestError('Subscription not found', [
        'Subscription to update not found',
      ]);
    }

    const updatedSubscription = await prisma.subscription.update({
      where: {
        telegramId: String(telegramId),
      },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString()
          : null,
      },
    });

    return updatedSubscription;
  }
}
