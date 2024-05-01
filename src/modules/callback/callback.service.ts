// import environment from '@/lib/environment';
import {
  ChangellyCryptoPaymentState,
  ChangellyErrorType,
  ChangellyErrorReason,
} from '@/types/changelly-api.type';
import { HttpInternalServerError } from '@/lib/errors';
import prisma, {
  type PaymentRequest,
  type User,
  type Reward,
  PaymentRequestStatus,
} from '@/lib/prisma';

export default class CallbackService {
  public async validateChangellyFiatPayment(): Promise<void> {}

  public async validateChangellyCryptoPayment(
    state: ChangellyCryptoPaymentState,
    telegramId?: string,
    paymentCode?: string
  ): Promise<void> {
    if (!telegramId) {
      throw new HttpInternalServerError('Crypto callback failed', [
        ChangellyErrorType.BAD_REQUEST,
        ChangellyErrorReason.INVALID_REQUEST_BODY,
        'No telegramId (customer_id) found in body',
      ]);
    }

    if (!paymentCode) {
      throw new HttpInternalServerError('Crypto callback failed', [
        ChangellyErrorType.BAD_REQUEST,
        ChangellyErrorReason.INVALID_REQUEST_BODY,
        'No payment code (order_id) found in body',
      ]);
    }

    const paymentRequest =
      await this.getPendingPaymentRequestByCode(paymentCode);

    if (paymentRequest.telegramId !== telegramId) {
      throw new HttpInternalServerError('Crypto callback failed', [
        ChangellyErrorType.BAD_REQUEST,
        ChangellyErrorReason.INVALID_REQUEST_PARAMETERS,
        'Mismatched telegramId (customer_id)',
      ]);
    }

    switch (state) {
      case ChangellyCryptoPaymentState.COMPLETED:
        await this.handleCryptoPaymentCompleted(paymentRequest);
        return;
      case ChangellyCryptoPaymentState.FAILED:
        await this.handleCryptoPaymentFailed(paymentRequest);
        return;
      case ChangellyCryptoPaymentState.CANCELED:
        await this.handleCryptoPaymentCanceled(paymentRequest);
        return;
      default:
        throw new HttpInternalServerError('Crypto callback failed', [
          ChangellyErrorType.BAD_REQUEST,
          ChangellyErrorReason.INVALID_REQUEST_PARAMETERS,
          'Invalid state',
        ]);
    }
  }

  private async handleCryptoPaymentCompleted(
    pendingRequest: PaymentRequest
  ): Promise<void> {
    // update PaymentRequest status to 'PAID'
    await prisma.paymentRequest.update({
      where: {
        id: {
          telegramId: pendingRequest.telegramId,
          saleName: pendingRequest.saleName,
          seqNo: pendingRequest.seqNo,
        },
      },
      data: {
        status: PaymentRequestStatus.PAID,
      },
    });

    // create buyer's Purchase instance
    await prisma.purchase.create({
      data: {
        telegramId: pendingRequest.telegramId,
        saleName: pendingRequest.saleName,
        amount: pendingRequest.amount,
      },
    });

    // distribute rewards to referrers
    await this.distributeRewards(pendingRequest);
  }

  private async handleCryptoPaymentFailed(
    pendingRequest: PaymentRequest
  ): Promise<void> {
    try {
      await prisma.paymentRequest.update({
        where: {
          id: {
            telegramId: pendingRequest.telegramId,
            saleName: pendingRequest.saleName,
            seqNo: pendingRequest.seqNo,
          },
        },
        data: {
          status: PaymentRequestStatus.FAILED,
        },
      });

      await prisma.sale.update({
        where: {
          name: pendingRequest.saleName,
        },
        data: {
          pendingOrderAmount: {
            decrement: pendingRequest.amount,
          },
        },
      });
    } catch (e) {
      throw new HttpInternalServerError('Crypto callback failed', [
        ChangellyErrorType.API_ERROR,
        ChangellyErrorReason.INTERNAL_UNKNOWN,
        e.message,
        e.code,
      ]);
    }
  }

  private async handleCryptoPaymentCanceled(
    pendingRequest: PaymentRequest
  ): Promise<void> {
    try {
      await prisma.paymentRequest.update({
        where: {
          id: {
            telegramId: pendingRequest.telegramId,
            saleName: pendingRequest.saleName,
            seqNo: pendingRequest.seqNo,
          },
        },
        data: {
          status: PaymentRequestStatus.CANCELLED,
        },
      });

      await prisma.sale.update({
        where: {
          name: pendingRequest.saleName,
        },
        data: {
          pendingOrderAmount: {
            decrement: pendingRequest.amount,
          },
        },
      });
    } catch (e) {
      throw new HttpInternalServerError('Crypto callback failed', [
        ChangellyErrorType.API_ERROR,
        ChangellyErrorReason.INTERNAL_UNKNOWN,
        e.message,
        e.code,
      ]);
    }
  }

  private async getPendingPaymentRequestByCode(
    paymentCode: string
  ): Promise<PaymentRequest> {
    const pendingRequest = await prisma.paymentRequest.findUnique({
      where: {
        code: paymentCode,
        status: PaymentRequestStatus.PENDING,
      },
    });

    if (!pendingRequest) {
      throw new HttpInternalServerError('Crypto callback failed', [
        ChangellyErrorType.BAD_REQUEST,
        ChangellyErrorReason.INVALID_REQUEST_PARAMETERS,
        'No pending payment request with given code',
      ]);
    }

    return pendingRequest;
  }

  private async distributeRewards(paidOrder: PaymentRequest): Promise<void> {
    const buyer = await prisma.user.findUnique({
      where: {
        telegramId: paidOrder.telegramId,
      },
      include: {
        referrer: true,
      },
    });

    if (!buyer) {
      throw new HttpInternalServerError('Crypto callback failed', [
        ChangellyErrorType.BAD_REQUEST,
        ChangellyErrorReason.INVALID_REQUEST_PARAMETERS,
        'No user found for the provided telegramId (customer_id)',
      ]);
    }

    let levelMinusOne = 0;
    let referrer: (User & { referrer?: User }) | null = buyer.referrer;
    let totalRewards = 0;
    const rewardRecordsToCreate: Array<Omit<Reward, 'createdAt'>> = [];
    try {
      while (
        referrer &&
        referrer.referralRewardLevelRates.length - 1 >= levelMinusOne
      ) {
        const rewardAmount =
          referrer.referralRewardLevelRates[levelMinusOne] * paidOrder.amount;

        rewardRecordsToCreate.push({
          telegramId: paidOrder.telegramId,
          saleName: paidOrder.saleName,
          refereeId: referrer.telegramId,
          amount: rewardAmount,
          referralLevel: ++levelMinusOne,
        });

        totalRewards += rewardAmount;

        if (!referrer.referrerId) break;
        referrer =
          referrer.referrer ??
          (await prisma.user.findUnique({
            where: {
              telegramId: referrer.referrerId,
            },
            include: {
              referrer: true,
            },
          }));
      }

      rewardRecordsToCreate.length &&
        (await prisma.reward.createMany({
          data: rewardRecordsToCreate,
        }));

      await prisma.sale.update({
        where: {
          name: paidOrder.saleName,
        },
        data: {
          pendingOrderAmount: {
            decrement: paidOrder.amount,
          },
          totalRewards: {
            increment: totalRewards,
          },
          totalSold: {
            increment: paidOrder.amount,
          },
        },
      });
    } catch (e) {
      throw new HttpInternalServerError('Crypto callback failed', [
        ChangellyErrorType.API_ERROR,
        ChangellyErrorReason.INTERNAL_UNKNOWN,
        e.message,
        e.code,
      ]);
    }
  }
}
