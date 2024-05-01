import request from 'supertest';
import { type ApiResponse } from '../../types/util-types';
import type { SaleExtended } from '../../../src/types/sale-response.type';
import App from '../../../src/app';
import prismaClient, { Prisma } from '../../../src/lib/prisma';
import {
  seedAdminData,
  buyerUserData,
  startNewSaleBody,
  adminAuthenticateBody,
} from '../../data/purchase-with-crypto';

/**
 * Integration testing is a type of software testing that focuses on testing
 * the interactions between different parts or components of a software application.
 * The goal of integration testing is to ensure that the different parts of the application
 * work together as expected and that they integrate seamlessly with each other.
 *
 * @ref https://en.wikipedia.org/wiki/Integration_testing
 */

describe('[Integration] - Sale API', () => {
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
  });

  afterAll(async () => {
    await clearDB();
    await prismaClient.$disconnect();
  });

  beforeEach(() => {
    jest.resetModules();
    jest.mock('../../../src/app');
  });

  it('{/sale/start-new} (SUCCESS): Should create new sale', async () => {
    const response = await request(app)
      .post(`/api/v1/${env}/sale/start-new`)
      .set('Accept', 'application/json')
      .set('Authorization', adminJwtToken)
      .send(startNewSaleBody);

    const { data } = response.body as ApiResponse<SaleExtended>;

    expect(data.name).toEqual(startNewSaleBody.name);
    expect(data.phases).toEqual(startNewSaleBody.phases);
    expect(data.tokensPerPhase).toEqual(startNewSaleBody.tokensPerPhase);
    expect(data.priceIncrement).toEqual(startNewSaleBody.priceIncrement);
    expect(data.initialPrice).toEqual(startNewSaleBody.initialPrice);
    expect(data.tokensForSale).toEqual(
      startNewSaleBody.tokensPerPhase.reduce((sum, curr) => (sum += curr))
    );
    expect(data.currentPhase).toEqual(1);
    expect(data.currentPrice).toEqual(startNewSaleBody.initialPrice);
  });

  it('{/sale/get-active-sale} (SUCCESS): Should match with "startNewSaleBody"', async () => {
    const response = await request(app).get(
      `/api/v1/${env}/sale/get-active-sale`
    );

    const { data } = response.body as ApiResponse<SaleExtended>;

    expect(data.name).toEqual(startNewSaleBody.name);
    expect(data.phases).toEqual(startNewSaleBody.phases);
    expect(data.tokensPerPhase).toEqual(startNewSaleBody.tokensPerPhase);
    expect(data.priceIncrement).toEqual(startNewSaleBody.priceIncrement);
    expect(data.initialPrice).toEqual(startNewSaleBody.initialPrice);
    expect(data.tokensForSale).toEqual(
      startNewSaleBody.tokensPerPhase.reduce((sum, curr) => (sum += curr))
    );
    expect(data.currentPhase).toEqual(1);
    expect(data.currentPrice).toEqual(startNewSaleBody.initialPrice);
  });

  it('{/sale/get-current-price} (SUCCESS): Should match with "startNewSaleBody" initialPrice', async () => {
    const response = await request(app).get(
      `/api/v1/${env}/sale/get-current-price`
    );

    const { data: currentPrice } = response.body as ApiResponse<string>;

    expect(currentPrice).toEqual(startNewSaleBody.initialPrice);
  });
});
