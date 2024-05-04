import { Router } from 'express';
import Controller from './sale.controller';
import { StartNewDto, PurchaseWithCryptoDto } from '@/dto/sale.dto';
import RequestValidator from '@/middlewares/request-validator';
import {
  verifyAdminUsertoken,
  verifyRegularUserToken,
} from '@/middlewares/user-auth';

const sale: Router = Router();
const controller = new Controller();

sale.post(
  '/start-new',
  verifyAdminUsertoken,
  RequestValidator.validate(StartNewDto),
  controller.startNew
);

sale.post(
  '/purchase-with-crypto',
  verifyRegularUserToken,
  RequestValidator.validate(PurchaseWithCryptoDto),
  controller.purchaseWithCrypto
);

sale.get('/get-current-price', controller.getCurrentSalePrice);

sale.get('/get-active-sale', controller.getActiveSale);

sale.get(
  '/generate-ton-payment-code',
  verifyRegularUserToken,
  controller.generateTonPaymentCode
);

sale.patch(
  '/edit-receiving-address/:saleName',
  verifyRegularUserToken,
  controller.editReceivingAddress
);

sale.patch(
  '/toggle-edit-receiving-address/:saleName',
  verifyAdminUsertoken,
  controller.toggleEditReceivingAddress
);

export default sale;
