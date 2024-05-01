import { type NextFunction /*, type Request */ } from 'express';
// import { type Sale } from '@prisma/client';
import { HttpStatusCode } from 'axios';
import CallbackService from './callback.service';
import { type CustomResponse } from '@/types/common.type';
import type {
  CryptoCallbackRequest,
  FiatCallbackRequest,
} from '@/types/extended-request.type';
import Api from '@/lib/api';

export default class CallbackController extends Api {
  private readonly callbackService = new CallbackService();

  public changellyFiatApiCallback = async (
    req: FiatCallbackRequest,
    res: CustomResponse<void>,
    next: NextFunction
  ) => {
    try {
      // TODO (Jak): Implement flow
      // Changelly Fiat API expects 200 Ok status to confirm all went fine
      // otherwise it'll keep sending periodic requests to this endpoint about the order
      this.send(res, undefined, HttpStatusCode.Ok);
    } catch (e) {
      next(e);
    }
  };

  public changellyCryptoApiCallback = async (
    req: CryptoCallbackRequest,
    res: CustomResponse<void>,
    next: NextFunction
  ) => {
    try {
      const telegramId = req.body.customer_id;
      const paymentCode = req.body.order_id;

      await this.callbackService.validateChangellyCryptoPayment(
        req.body.state,
        telegramId,
        paymentCode
      );

      this.send(res, undefined, HttpStatusCode.NoContent);
    } catch (e) {
      next(e);
    }
  };
}
