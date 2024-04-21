import { Router } from 'express';
import Controller from './subscription.controller';
import { SubscriptionDto } from '@/dto/subscription.dto';
import { verifyXApiAuthKey } from '@/middlewares/api-auth';
import RequestValidator from '@/middlewares/request-validator';

const subscriptions: Router = Router();
const controller = new Controller();

subscriptions.get('/:telegramId', verifyXApiAuthKey, controller.get);

subscriptions.post(
  '/submit',
  verifyXApiAuthKey,
  RequestValidator.validate(SubscriptionDto),
  controller.register
);

subscriptions.post(
  '/update',
  verifyXApiAuthKey,
  RequestValidator.validate(SubscriptionDto),
  controller.update
);

export default subscriptions;
