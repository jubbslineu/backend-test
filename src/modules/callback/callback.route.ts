import { Router } from 'express';
import Controller from './callback.controller';
import {
  ChangellyCryptoCallbackDTO,
  ChangellyFiatCallbackDTO,
} from '@/dto/callback.dto';
import RequestValidator from '@/middlewares/request-validator';
import {
  verifyFiatCallbackHeader,
  verifyCryptoCallbackHeader,
} from '@/middlewares/changelly-callback-auth';

const callback: Router = Router();
const controller = new Controller();

callback.post(
  '/changelly-fiat-api-callback',
  verifyFiatCallbackHeader,
  RequestValidator.validate(ChangellyFiatCallbackDTO),
  controller.changellyFiatApiCallback
);

callback.post(
  '/changelly-crypto-api-callback',
  verifyCryptoCallbackHeader,
  RequestValidator.validate(ChangellyCryptoCallbackDTO),
  controller.changellyCryptoApiCallback
);

export default callback;
