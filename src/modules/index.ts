import { Router } from 'express';

import sale from './sale/sale.route';
import subscriptions from './subscription/subscription.route';
import users from './users/users.route';

const router: Router = Router();

router.use('/sale', sale);
router.use('/users', users);
router.use('/subscription', subscriptions);

export default router;
