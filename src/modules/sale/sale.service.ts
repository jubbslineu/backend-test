// import LogMessage from '@/decorators/log-message.decorator';
import { createHash } from 'crypto';
import { type Coin, type CryptoCurrency, type Currency } from './types';
import environment from '@/lib/environment';
import {
  HttpBadRequestError,
  HttpInternalServerError,
  HttpNotFoundError,
} from '@/lib/errors';
import { geckoClient } from '@/lib/gecko-client';
import prisma, {
  PaymentMethod,
  PaymentRequestStatus,
  SaleStatus,
  type Decimal,
  type User,
} from '@/lib/prisma';

interface PhaseStats {
  phase: number;
  lowerLimit: number;
  upperLimit: number;
}

interface Sale {
  name: string;
  status: SaleStatus;
  phases: number;
  tokensPerPhase: number[];
  initialPrice: Decimal;
  priceIncrement: Decimal[];
  start: Date | null;
  end: Date | null;
  pausedTime: number;
  totalSold: number;
  totalRewards: number;
  createdAt: Date;
  pausedAt: Date | null;
}

interface SaleResponseObject
  extends Omit<Omit<Sale, 'initialPrice'>, 'priceIncrement'> {
  initialPrice: string;
  priceIncrement: string[];
}

interface SaleExtended extends SaleResponseObject {
  currentPhase?: number;
  lowerTokenLimit?: number;
  upperTokenLimit?: number;
  currentPrice?: string;
  tokensForSale?: number;
  remainingTokens?: number;
  remainingPhaseTokens?: number;
}

interface SaleInitParams {
  name: string;
  phases: number;
  tokensPerPhase: number[];
  initialPrice: number;
  priceIncrementPerPhase: number;
}

interface PaymentRequestPayload {
  amount: number;
}

type SaleParam = string | Sale;

export default class SaleService {
  public async startNew(
    init: SaleInitParams,
    returnExtended: boolean = false
  ): Promise<SaleResponseObject> {
    try {
      const activeSale = await this.currentActiveSale();
      throw new HttpBadRequestError('Sale already ongoing', [
        `Sale with name ${activeSale.name} is active`,
        'Wait for current sale to finish or pause it before proceeding',
      ]);
    } catch (e) {
      if (!(e instanceof HttpNotFoundError)) {
        throw new HttpInternalServerError('Unknown error', e.errors);
      }
    }

    if (await prisma.sale.findUnique({ where: { name: init.name } })) {
      throw new HttpBadRequestError('Sale already exists', [
        `Sale with name ${init.name} already exists`,
      ]);
    }

    const newSale = await prisma.sale.create({
      data: {
        ...init,
        status: SaleStatus.ON_SALE,
      },
    });

    return returnExtended
      ? this.extendSaleProperties(newSale)
      : this.convertToSaleResponse(newSale);
  }

  public async getActiveSale(extended: boolean = false): Promise<SaleExtended> {
    const activeSale = await this.currentActiveSale();

    if (extended) {
      return this.extendSaleProperties(activeSale);
    }

    return this.convertToSaleResponse(activeSale);
  }

  public async generateTonPaymentCode(
    user: User,
    payload: PaymentRequestPayload
  ): Promise<string> {
    const activeSale = await this.currentActiveSale();

    await this.cancelAllExpiredRequests(activeSale.name);

    const activeRequest = await prisma.paymentRequest.findFirst({
      where: {
        status: PaymentRequestStatus.PENDING,
        saleName: activeSale.name,
        telegramId: user.telegramId,
      },
    });

    if (activeRequest) {
      throw new HttpBadRequestError('Payment request active', [
        'Cancel ongoing requests to create a new one',
      ]);
    }

    const newRequest = await this.createNewPaymentRequest(
      activeSale,
      user.telegramId,
      await this.getNextAvailableSeqNo(activeSale.name, user.telegramId),
      payload.amount
    );

    return newRequest.code;
  }

  public async pauseSale(): Promise<SaleResponseObject> {
    const activeSale = await this.currentActiveSale();

    const updatedSale = await prisma.sale.update({
      where: {
        name: activeSale.name,
      },
      data: {
        pausedAt: new Date(),
        status: SaleStatus.PAUSED,
      },
    });

    return this.convertToSaleResponse(updatedSale);
  }

  public async resumeSale(sale: SaleParam): Promise<Sale> {
    const activeSale = await this.currentActiveSale();
    if (activeSale) {
      throw new HttpBadRequestError('Sale is ongoing', [
        `Sale with name ${activeSale.name} is active`,
        'Please pause ongoing sale before resuming another one',
      ]);
    }

    return await prisma.sale.update({
      where: {
        name: typeof sale === 'string' ? sale : sale.name,
      },
      data: {
        pausedAt: null,
        status: SaleStatus.ON_SALE,
        pausedTime: await this.totalPausedTime(sale),
      },
    });
  }

  public async getSalebyName(saleName: string): Promise<Sale> {
    const sale = await prisma.sale.findUnique({
      where: {
        name: saleName,
      },
    });

    if (!sale) {
      throw new HttpNotFoundError('Sale not found', [
        `No sale exists with the name ${saleName}`,
      ]);
    }

    return sale;
  }

  public async totalPausedTime(sale?: SaleParam): Promise<number> {
    if (!sale) {
      sale = await this.currentActiveSale();
    } else if (typeof sale === 'string') {
      sale = await this.getSalebyName(sale);
    }

    const currentPausedTime = sale.pausedAt
      ? Math.floor(Date.now() / 1000) - sale.pausedAt.getSeconds()
      : 0;

    return sale.pausedTime + currentPausedTime;
  }

  public async getSaleElapsedTime(sale?: SaleParam): Promise<number> {
    if (!sale) {
      sale = await this.currentActiveSale();
    } else {
      if (typeof sale === 'string') {
        sale = await this.getSalebyName(sale);
      }

      if (!sale.start) throw new HttpInternalServerError('Sale not started');
    }

    return (
      Math.floor(Date.now() / 1000) -
      sale.start!.getSeconds() -
      (await this.totalPausedTime(sale))
    );
  }

  public async getCurrentSalePrice(sale?: SaleParam): Promise<string> {
    if (!sale) {
      sale = await this.currentActiveSale();
    } else if (typeof sale === 'string') {
      sale = await this.getSalebyName(sale);
    }

    return this.calculateSalePrice(sale).toFixed(2);
  }

  public getCurrentPhaseStats(sale: Sale): PhaseStats {
    let currentPhase = 0;
    const upperLimit = sale.tokensPerPhase
      .slice(0)
      .reduce(
        (phaseTokenLowerbound, phaseTokenIncrement, phaseMinusOne, arr) => {
          const phaseTokenUpperbound =
            phaseTokenLowerbound + phaseTokenIncrement;

          if (
            phaseMinusOne + 1 >= sale.phases ||
            sale.totalSold <= phaseTokenUpperbound
          ) {
            arr.splice(1);
            currentPhase = phaseMinusOne + 1;
          }

          return phaseTokenUpperbound;
        }
      );

    return {
      phase: currentPhase,
      lowerLimit: upperLimit - sale.tokensPerPhase[currentPhase - 1],
      upperLimit,
    };
  }

  private calculateSalePrice(sale: Sale, currentPhase?: number): Decimal {
    if (!currentPhase) {
      currentPhase = this.getCurrentPhaseStats(sale).phase;
    }

    return sale.initialPrice.add(
      sale.priceIncrement
        .splice(0, currentPhase)
        .reduce((sum, curr) => sum.add(curr))
    );
  }

  private extendSaleProperties(sale: Sale): SaleExtended {
    const phaseStats = this.getCurrentPhaseStats(sale);
    const tokensForSale = sale.tokensPerPhase.reduce((sum, curr) => sum + curr);

    return {
      ...sale,
      initialPrice: sale.initialPrice.toFixed(2),
      priceIncrement: sale.priceIncrement.map((price) => price.toFixed(2)),
      currentPhase: phaseStats.phase,
      lowerTokenLimit: phaseStats.lowerLimit,
      upperTokenLimit: phaseStats.upperLimit,
      currentPrice: this.calculateSalePrice(sale, phaseStats.phase).toFixed(2),
      tokensForSale,
      remainingTokens: tokensForSale - sale.totalSold,
      remainingPhaseTokens: phaseStats.upperLimit - sale.totalSold,
    };
  }

  private convertToSaleResponse(sale: Sale): SaleResponseObject {
    return {
      ...sale,
      initialPrice: sale.initialPrice.toFixed(2),
      priceIncrement: sale.priceIncrement.map((price) => price.toFixed(2)),
    };
  }

  private async currentActiveSale(): Promise<Sale> {
    const activeSale = await prisma.sale.findFirst({
      where: {
        status: SaleStatus.ON_SALE,
      },
    });

    if (!activeSale) {
      throw new HttpNotFoundError('No active sale', [
        'SaleStatus.ON_SALE status not found',
      ]);
    }

    return activeSale;
  }

  private async convertCurrency(
    amount: number,
    from: Currency = 'USD',
    to: CryptoCurrency = 'TON'
  ) {
    const rat = await geckoClient.get<Coin[]>(`/coins/list`);
    const coin = rat.data.find((coin) => coin.symbol === to.toLowerCase());

    if (!coin) {
      throw new HttpInternalServerError('Currency not found', [
        `Currency ${to} not supported`,
      ]);
    }

    const rate = await geckoClient.get(`/simple/price`, {
      params: {
        ids: coin.id,
        vs_currencies: from,
      },
    });

    // maybe the result should be .toFixed(certain number of decimal places)
    const result = amount * rate.data[coin.id][from.toLowerCase()];

    if (isNaN(result)) {
      throw new HttpInternalServerError('Invalid amount', [
        `Amount ${amount} is invalid`,
      ]);
    }

    return result;
  }

  private async cancelAllExpiredRequests(saleName: string) {
    const amountToBeReleased = (
      await prisma.paymentRequest.aggregate({
        where: {
          saleName,
          expireAt: { lte: new Date() },
        },
        _sum: {
          amount: true,
        },
      })
    )._sum?.amount;

    if (!amountToBeReleased) return;

    await prisma.sale.update({
      where: {
        name: saleName,
      },
      data: {
        pendingOrderAmount: {
          decrement: amountToBeReleased,
        },
      },
    });

    await prisma.paymentRequest.updateMany({
      where: {
        saleName,
      },
      data: {
        status: PaymentRequestStatus.CANCELLED,
      },
    });
  }

  private async getNextAvailableSeqNo(
    saleName: string,
    telegramId: string
  ): Promise<number> {
    const seqNo = await prisma.paymentRequest.count({
      where: {
        telegramId,
        saleName,
      },
    });

    return seqNo;
  }

  private async createNewPaymentRequest(
    activeSale: Sale,
    telegramId: string,
    seqNo: number,
    amount: number
  ) {
    const newRequest = await prisma.paymentRequest.create({
      data: {
        telegramId,
        saleName: activeSale.name,
        seqNo,
        method: PaymentMethod.TON,
        expireAt: new Date(
          Date.now() + +environment.paymentRequestExpireIn * 1000
        ),
        destination: environment.tonPaymentDestinationAddress,
        amount,
        price: await this.convertCurrency(
          this.calculateSalePrice(activeSale).toNumber()
        ),
        code: createHash('sha256')
          .update(
            JSON.stringify({
              telegramId,
              saleName: activeSale.name,
              seqNo,
            })
          )
          .digest('base64'),
      },
    });

    await prisma.sale.update({
      where: {
        name: activeSale.name,
      },
      data: {
        pendingOrderAmount: {
          increment: amount,
        },
      },
    });

    return newRequest;
  }
}
