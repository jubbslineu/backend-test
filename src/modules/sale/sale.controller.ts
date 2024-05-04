import { type NextFunction, type Request } from 'express';
import { HttpStatusCode } from 'axios';
import SaleService from './sale.service';
import { type CustomResponse } from '@/types/common.type';
import type { RequestWithUser } from '@/types/extended-request.type';
import type {
  CreateCryptoPaymentResponse,
  GenerateTonPaymentCodeResponse,
  EditReceivingAddressResponse,
  SaleExtended,
} from '@/types/sale-response.type';
import Api from '@/lib/api';
import { HttpBadRequestError } from '@/lib/errors';

export default class SaleController extends Api {
  private readonly saleService = new SaleService();

  public startNew = async (
    req: Request,
    res: CustomResponse<SaleExtended>,
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
    res: CustomResponse<string>,
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
    res: CustomResponse<SaleExtended>,
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

  public editReceivingAddress = async (
    req: RequestWithUser,
    res: CustomResponse<EditReceivingAddressResponse>,
    next: NextFunction
  ) => {
    try {
      const updatedUserAddressInfo = this.saleService.editReceivingAddress(
        req.params.saleName,
        req.user.telegramId,
        req.body.newReceivingAddress
      );
      this.send(
        res,
        updatedUserAddressInfo,
        HttpStatusCode.Accepted,
        `Receiving address updated for sale: ${req.params.saleName}`
      );
    } catch (e) {
      next(e);
    }
  };

  public toggleEditReceivingAddress = async (
    req: Request,
    res: CustomResponse<EditReceivingAddressResponse>,
    next: NextFunction
  ) => {
    try {
      await this.saleService.toggleEditReceivingAddress(
        req.params.saleName,
        SaleController.parseBooleanString(
          req.query.allow as string | undefined,
          'allow'
        )
      );

      this.send(
        res,
        undefined,
        HttpStatusCode.Accepted,
        `Receiving address updated for sale: ${req.params.saleName}`
      );
    } catch (e) {
      next(e);
    }
  };

  private static parseBooleanString(boolString?: string, paramName?: string) {
    if (!boolString) {
      throw new HttpBadRequestError('Invalid parameter', [
        'Missing parameter' + (paramName ? `: ${paramName}` : ''),
        'Should be set to "true" or "false"',
      ]);
    }

    switch (boolString.toLowerCase()) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        throw new HttpBadRequestError(
          'Invalid parameter' + (paramName ? `: ${paramName}` : ''),
          [boolString, 'Should be set to "true" or "false"']
        );
    }
  }
}
