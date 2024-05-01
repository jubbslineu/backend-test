import request from 'supertest';
import { type ApiResponse } from '../../types/util-types';
import App from '../../../src/app';
import prismaClient, { Prisma } from '../../../src/lib/prisma';
import {
  seedAdminData,
  buyerUserData,
  startNewSaleBody,
  adminAuthenticateBody,
} from '../../data/purchase-with-crypto';

/**
 * End-to-end (E2E) testing is a type of software testing that focuses on
 * testing the complete flow of a software application from start to finish.
 * The goal of E2E testing is to simulate real user scenarios and ensure that
 * the application works as expected in a real-world environment.
 *
 * @ref https://katalon.com/resources-center/blog/end-to-end-e2e-testing
 */

describe('[e2e] - purchase-with-crypto', () => {
  const seedUsers = [seedAdminData, buyerUserData];
  const env = process.env.NODE_ENV;
  const app = new App().express;

  let adminJwtToken: string;

  const clearDB = async () => {
    // delete test sale
    try {
      await prismaClient.sale.delete({
        where: {
          name: startNewSaleBody.name,
        },
      });
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
        throw e;
      }
    }
    // delete test users
    try {
      await prismaClient.user.deleteMany({
        where: {
          telegramId: {
            in: seedUsers.map((user) => user.telegramId),
          },
        },
      });
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError)) {
        throw e;
      }
    }
  };

  beforeAll(async () => {
    // clear DB
    await clearDB();

    // create seed admin and buyer
    await prismaClient.user.createMany({
      data: seedUsers,
    });

    // get admin JWT token
    const response = await request(app)
      .post(`/api/v1/${env}/users/authenticate`)
      .set('Accept', 'application/json')
      .send(adminAuthenticateBody);

    const { data } = response.body as ApiResponse<{ token: string }>;
    adminJwtToken = data.token;

    // create sale
    await request(app)
      .post(`/api/v1/${env}/sale/start-new`)
      .set('Accept', 'application/json')
      .set('Authorization', adminJwtToken)
      .send(startNewSaleBody);
  });

  afterAll(async () => {
    await clearDB();
    await prismaClient.$disconnect();
  });

  beforeEach(() => {
    jest.resetModules();
    jest.mock('../../../src/app');
  });

  it('{/sale/purchase-with-crypto} (SUCCESS): User creates crypto payment', async () => {
    // TODO: create crypto payment with '/sale/purchase-with-crypto'
    // Mock 'axios.request' to return a successful response (same format as the response from changelly)
    // Create request RSA key pairs and mock environment.changellyCryptoPrivKey with private key
    // Call endpoint and check response with "expect" function
  });

  it('{/callback/changelly-crypto-api-callback} (SUCCESS): Should validate user payment if state is "COMPLETED"', async () => {
    // TODO: create crypto payment with '/callback/changelly-crypto-api-callback'
    // Create callback RSA key pairs and mock environment.changellyCryptoCallbackPubKey with public key
    // Call endpoint with body and X-Signature as specified here https://api.pay.changelly.com/#tag/Callbacks/operation/Callback
    // state should be "COMPLETED", there're also "FAILED" and "CANCELED" to be tested in other "it"'s
    // Check response if response has status code NoContent (204) and other database checks
  });
});
