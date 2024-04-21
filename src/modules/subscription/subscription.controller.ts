import type { Subscription } from '@prisma/client';
import { HttpStatusCode } from 'axios';
import { type NextFunction, type Request } from 'express';
import SubscriptionService from './subscription.service';
import { type CustomResponse } from '@/types/common.type';
import Api from '@/lib/api';

export default class SubscriptionController extends Api {
  private readonly subscriptionService = new SubscriptionService();

  public get = async (
    req: Request,
    res: CustomResponse<Subscription>,
    next: NextFunction
  ) => {
    try {
      const subscription =
        await this.subscriptionService.getSubscriptionByTelegramId(
          req.params.telegramId
        );

      if (!subscription) {
        return this.send(
          res,
          {},
          HttpStatusCode.NotFound,
          'Subscription Not Found'
        );
      }

      this.send(
        res,
        subscription,
        HttpStatusCode.Found,
        'Subscription Retrieved'
      );
    } catch (e) {
      next(e);
    }
  };

  public register = async (
    req: Request,
    res: CustomResponse<Subscription>,
    next: NextFunction
  ) => {
    try {
      const userJwt = await this.subscriptionService.createSubscriptionRecord(
        req.body
      );

      this.send(
        res,
        { token: userJwt },
        HttpStatusCode.Accepted,
        'Subscription JWT Created'
      );
    } catch (e) {
      next(e);
    }
  };

  public update = async (
    req: Request,
    res: CustomResponse<Subscription>,
    next: NextFunction
  ) => {
    try {
      const updatedSubscription =
        await this.subscriptionService.updateSubscription(req.body);

      this.send(
        res,
        updatedSubscription,
        HttpStatusCode.Accepted,
        'Subscription Updated'
      );
    } catch (e) {
      next(e);
    }
  };
}
