import { Router } from 'express';
import Controller from './sale.controller';
import { StartNewDto } from '@/dto/sale.dto';
import RequestValidator from '@/middlewares/request-validator';
import {
  verifyAdminUsertoken,
  verifyRegularUserToken,
} from '@/middlewares/auth';

const sale: Router = Router();
const controller = new Controller();

sale.post(
  '/start-new',
  verifyAdminUsertoken,
  RequestValidator.validate(StartNewDto),
  controller.startNew
);

sale.get('/get-current-price', controller.getCurrentSalePrice);

sale.get('/get-active-sale', controller.getActiveSale);

sale.get(
  '/generate-ton-payment-code',
  verifyRegularUserToken,
  controller.generateTonPaymentCode
);

export default sale;
