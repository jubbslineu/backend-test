// import LogMessage from '@/decorators/log-message.decorator';
import { createHash } from 'crypto';
import { type Coin, type CryptoCurrency, type Currency } from './types';
import type {
  SaleResponseObject,
  SaleExtended,
} from '@/types/sale-response.type';
import environment from '@/lib/environment';
import {
  HttpBadRequestError,
  HttpInternalServerError,
  HttpNotFoundError,
} from '@/lib/errors';
import { geckoClient } from '@/lib/gecko-client';
import prisma, {
  Decimal,
  PaymentMethod,
  PaymentRequestStatus,
  SaleStatus,
  type User,
  type Sale,
} from '@/lib/prisma';
import {
  ChangellyClient,
  ApiOptions,
  CryptoEndpoints,
} from '@/lib/changelly-client';

interface PhaseStats {
  phase: number;
  lowerLimit: number;
  upperLimit: number;
}

interface SaleInitParams {
  name: string;
  phases: number;
  tokensPerPhase: number[];
  initialPrice: number;
  priceIncrementPerPhase: number;
}

interface PaymentRequestBody {
  amount: number;
}

type SaleParam = string | Sale;

export default class SaleService {
  private readonly _cryptoPaymentClient = new ChangellyClient(
    ApiOptions.CRYPTO
  );

  public async startNew(
    init: SaleInitParams,
    returnExtended: boolean = false
  ): Promise<SaleExtended> {
    const activeSale = await this._getActiveSale();
    if (activeSale) {
      throw new HttpBadRequestError('Sale already ongoing', [
        `Sale with name ${activeSale.name} is active`,
        'Wait for current sale to finish or pause it before proceeding',
      ]);
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

  public async createCryptoPayment(user: User, body: any): Promise<string> {
    // get active sale
    const activeSale = await this.currentActiveSale();

    // get user SeqNo
    const seqNo = await this.getNextAvailableSeqNo(
      activeSale.name,
      user.telegramId
    );

    // create payment code
    const paymentCode = this._createPaymentCode(
      user.telegramId,
      activeSale.name,
      seqNo
    );

    // get total price
    const totalPrice = this.calculateTotalPrice(body.amount, activeSale);

    const expireDate = new Date(
      this._cryptoPaymentClient.getExpirationTimestampSeconds() * 1000
    );

    // create payment order
    try {
      const response = await this._cryptoPaymentClient.fetch(
        CryptoEndpoints.CreatePayment,
        {
          customer_id: user.telegramId,
          customer_email: body.userEmail ?? environment.defaultCustomerEmail,
          order_id: paymentCode,
          nominal_currency: 'USDT',
          nominal_amount: totalPrice.toFixed(2),
          fees_payer: environment.changellyFeesPayer,
          pending_deadline_at: expireDate,
          success_redirect_url: environment.changellySuccessUrl,
          failure_redirect_url: environment.changellyFailUrl,
        }
      );

      // create payment request
      /* const newRequest = */ await this.createNewPaymentRequest(
        activeSale,
        user.telegramId,
        body.paymentMethod.currency,
        seqNo,
        body.amount,
        environment.changellyPaymentReceiver,
        {
          paymentCode,
          totalPrice: totalPrice.toNumber(),
          expireAt: expireDate,
        }
      );

      return response.data.payment_url;
    } catch (e) {
      throw new HttpInternalServerError(
        'Failed creating crypto payment order',
        [e.message, ...e.errors]
      );
    }
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
    body: PaymentRequestBody
  ): Promise<string> {
    const activeSale = await this.currentActiveSale();

    await this.cancelAllExpiredRequests(activeSale.name, PaymentMethod.TON);

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
      PaymentMethod.TON,
      await this.getNextAvailableSeqNo(activeSale.name, user.telegramId),
      body.amount,
      environment.tonPaymentDestinationAddress,
      {
        convertTo: 'TON',
      }
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

    return this.calculateTokenPrice(sale).toFixed(2);
  }

  public getCurrentPhaseStats(sale: Sale): PhaseStats {
    let currentPhase = 0;
    const upperLimit = sale.tokensPerPhase
      .slice(0)
      .reduce((phaseTokenLowerbound, phaseTokenIncrement, phase, arr) => {
        const phaseTokenUpperbound = phaseTokenLowerbound + phaseTokenIncrement;
        if (
          phase >= sale.phases ||
          sale.totalSold + sale.pendingOrderAmount <= phaseTokenUpperbound
        ) {
          arr.splice(1);
          currentPhase = phase;
        }

        return phaseTokenUpperbound;
      });

    return {
      phase: currentPhase,
      lowerLimit: upperLimit - sale.tokensPerPhase[currentPhase - 1],
      upperLimit,
    };
  }

  private calculateTokenPrice(sale: Sale, currentPhase?: number): Decimal {
    if (!currentPhase) {
      currentPhase = this.getCurrentPhaseStats(sale).phase;
    }

    return sale.initialPrice.add(
      sale.priceIncrement
        .slice(0, currentPhase - 1)
        .reduce((sum, curr) => sum.add(curr), new Decimal(0))
    );
  }

  private calculateTotalPrice(amount: number, sale: Sale): Decimal {
    let { phase: currentPhase, upperLimit } = this.getCurrentPhaseStats(sale);
    let tokenPrice = this.calculateTokenPrice(sale, currentPhase);

    let totalPrice = new Decimal(0);
    let tokensFilled = sale.totalSold + sale.pendingOrderAmount;
    while (tokensFilled + amount > upperLimit) {
      if (currentPhase >= sale.phases) {
        throw new HttpBadRequestError('Not enough tokens for sale', [
          'Cannot calculate total price',
        ]);
      }
      const remainingPhaseAmount = upperLimit - tokensFilled;
      totalPrice = totalPrice.add(tokenPrice.mul(remainingPhaseAmount));
      amount -= remainingPhaseAmount;
      tokensFilled = upperLimit;
      currentPhase++;
      upperLimit = upperLimit + sale.tokensPerPhase[currentPhase - 1];
      tokenPrice = tokenPrice.add(sale.priceIncrement[currentPhase - 2]);
    }

    totalPrice = totalPrice.add(tokenPrice.mul(amount));
    tokensFilled += amount;

    return totalPrice;
  }

  private extendSaleProperties(sale: Sale): SaleExtended {
    const phaseStats = this.getCurrentPhaseStats(sale);
    const tokensForSale = sale.tokensPerPhase.reduce((sum, curr) => sum + curr);
    const tokensFilled = sale.totalSold + sale.pendingOrderAmount;

    return {
      ...sale,
      initialPrice: sale.initialPrice.toFixed(2),
      priceIncrement: sale.priceIncrement.map((price) => price.toFixed(2)),
      currentPhase: phaseStats.phase,
      lowerTokenLimit: phaseStats.lowerLimit,
      upperTokenLimit: phaseStats.upperLimit,
      currentPrice: this.calculateTokenPrice(sale, phaseStats.phase).toFixed(2),
      tokensForSale,
      remainingTokens: tokensForSale - tokensFilled,
      remainingPhaseTokens: phaseStats.upperLimit - tokensFilled,
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
    const activeSale = await this._getActiveSale();

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

  private async cancelAllExpiredRequests(
    saleName: string,
    paymentMethod?: PaymentMethod
  ) {
    const amountToBeReleased = (
      await prisma.paymentRequest.aggregate({
        where: {
          saleName,
          expireAt: { lte: new Date() },
          method: paymentMethod,
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
    paymentMethod: PaymentMethod,
    seqNo: number,
    amount: number,
    destination: string,
    override?: {
      convertTo?: CryptoCurrency;
      paymentCode?: string;
      totalPrice?: number;
      expireAt?: string | number | Date;
    }
  ) {
    // calculate total purchase price
    const totalPrice =
      override?.totalPrice ??
      this.calculateTotalPrice(amount, activeSale).toNumber();

    // create new payment request instance
    const newRequest = await prisma.paymentRequest.create({
      data: {
        telegramId,
        saleName: activeSale.name,
        seqNo,
        method: paymentMethod,
        expireAt: new Date(
          override?.expireAt ??
            Date.now() + +environment.paymentRequestExpireIn * 1000
        ),
        destination,
        amount,
        price: override?.convertTo
          ? await this.convertCurrency(totalPrice, 'USD', override.convertTo)
          : totalPrice,
        code:
          override?.paymentCode ??
          this._createPaymentCode(telegramId, activeSale.name, seqNo),
      },
    });

    // update `pedingOrderAmount` for the sale
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

  private async _getActiveSale(): Promise<Sale | null> {
    return await prisma.sale.findFirst({
      where: {
        status: SaleStatus.ON_SALE,
      },
    });
  }

  private _createPaymentCode(
    telegramId: string,
    saleName: string,
    seqNo: number
  ): string {
    return createHash('sha256')
      .update(
        JSON.stringify({
          telegramId,
          saleName,
          seqNo,
        })
      )
      .digest('base64');
  }
}
