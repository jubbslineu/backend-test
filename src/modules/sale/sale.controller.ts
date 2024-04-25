import { type NextFunction, type Request } from 'express';
import { type Sale } from '@prisma/client';
import { HttpStatusCode } from 'axios';
import SaleService from './sale.service';
import { type CustomResponse } from '@/types/common.type';
import type { RequestWithUser } from '@/types/extended-request.type';
import Api from '@/lib/api';

interface CreateCryptoPaymentResponse {
  paymentUrl: string;
}

interface GenerateTonPaymentCodeResponse {
  paymentCode: string;
}

export default class SaleController extends Api {
  private readonly saleService = new SaleService();

  public startNew = async (
    req: Request,
    res: CustomResponse<Sale>,
    next: NextFunction
  ) => {
    try {
      const sale = await this.saleService.startNew(req.body, true);
      this.send(res, sale, HttpStatusCode.Created, 'Sale started');
    } catch (e) {
      next(e);
    }
  };

  public purchaseWithCrypto = async (
    req: RequestWithUser,
    res: CustomResponse<CreateCryptoPaymentResponse>,
    next: NextFunction
  ) => {
    try {
      const paymentUrl = await this.saleService.createCryptoPayment(
        req.user,
        req.body
      );
      this.send(res, { paymentUrl }, HttpStatusCode.Created, 'Order created');
    } catch (e) {
      next(e);
    }
  };

  public getCurrentSalePrice = async (
    _req: Request,
    res: CustomResponse<Sale>,
    next: NextFunction
  ) => {
    try {
      const salePrice = await this.saleService.getCurrentSalePrice();
      this.send(res, salePrice, HttpStatusCode.Accepted, 'Sale ongoing');
    } catch (e) {
      next(e);
    }
  };

  public getActiveSale = async (
    _req: Request,
    res: CustomResponse<Sale>,
    next: NextFunction
  ) => {
    try {
      const sale = await this.saleService.getActiveSale(true);
      this.send(res, sale, HttpStatusCode.Accepted, 'Extended sale info');
    } catch (e) {
      next(e);
    }
  };

  public generateTonPaymentCode = async (
    req: RequestWithUser,
    res: CustomResponse<GenerateTonPaymentCodeResponse>,
    next: NextFunction
  ) => {
    try {
      const paymentCode = await this.saleService.generateTonPaymentCode(
        req.user,
        req.body
      );

      this.send(
        res,
        { paymentCode },
        HttpStatusCode.Accepted,
        'Please proceed with the payment'
      );
    } catch (e) {
      next(e);
    }
  };
}
