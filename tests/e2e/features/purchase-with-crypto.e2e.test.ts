import crypto from 'crypto';
import request from 'supertest';
import { type ApiResponse } from '../../types/util-types';
import App from '../../../src/app';
import prismaClient, {
  Prisma,
  PaymentRequestStatus,
} from '../../../src/lib/prisma';
import environment from '../../../src/lib/environment';
import { changellyClientCrypto } from '../../../src/lib/changelly-client';
import {
  getPaymentRequestSeqNo,
  calculateOrderTotalPrice,
  createPaymentCodeSync,
} from '../utils/common';
import {
  seedAdminData,
  buyerUserData,
  startNewSaleBody,
  adminAuthenticateBody,
  buyerAuthenticateBody,
  purchaseWithCryptoBody,
  changellyCreatePaymentMockResponse,
  cryptoCallbackBody,
} from '../../data/purchase-with-crypto';

/**
 * End-to-end (E2E) testing is a type of software testing that focuses on
 * testing the complete flow of a software application from start to finish.
 * The goal of E2E testing is to simulate real user scenarios and ensure that
 * the application works as expected in a real-world environment.
 *
 * @ref https://katalon.com/resources-center/blog/end-to-end-e2e-testing
 */

jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  create: (...args: any[]) => jest.requireMock('axios'),
  request: async (...args: any[]) =>
    await Promise.resolve(changellyCreatePaymentMockResponse),
}));

const getBuyerOrder = async (seqNo?: number) => {
  if (!seqNo) {
    seqNo =
      (await getPaymentRequestSeqNo(
        buyerUserData.telegramId,
        startNewSaleBody.name
      )) - 1;
  }

  return await prismaClient.paymentRequest.findUnique({
    where: {
      id: {
        telegramId: buyerUserData.telegramId,
        saleName: startNewSaleBody.name,
        seqNo,
      },
    },
  });
};

describe('[e2e] - purchase-with-crypto', () => {
  const seedUsers = [seedAdminData, buyerUserData];
  const env = process.env.NODE_ENV;
  const app = new App().express;

  let adminJwtToken: string;
  let buyerJwtToken: string;

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
    let response = await request(app)
      .post(`/api/v1/${env}/users/authenticate`)
      .set('Accept', 'application/json')
      .send(adminAuthenticateBody);

    let { data } = response.body as ApiResponse<{ token: string }>;
    adminJwtToken = data.token;

    // get buyer JWT
    response = await request(app)
      .post(`/api/v1/${env}/users/authenticate`)
      .set('Accept', 'application/json')
      .send(buyerAuthenticateBody);

    ({ data } = response.body as ApiResponse<{ token: string }>);
    buyerJwtToken = data.token;

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
    // generate Changelly API key pair mock
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    // mock public key
    jest.spyOn(environment, 'changellyCryptoApiKey', 'get').mockReturnValue(
      publicKey
        .export({
          type: 'pkcs1',
          format: 'pem',
        })
        .toString('base64')
    );

    // mock private key
    jest.spyOn(environment, 'changellyCryptoPrivKey', 'get').mockReturnValue(
      privateKey
        .export({
          type: 'pkcs1',
          format: 'pem',
        })
        .toString('base64')
    );

    // spy on getExpirationTimestampSeconds method for later assetions
    const expirationTimestamp =
      changellyClientCrypto.getExpirationTimestampSeconds();
    const expireAtSpy = jest
      .spyOn(changellyClientCrypto, 'getExpirationTimestampSeconds')
      .mockReturnValueOnce(expirationTimestamp);

    const seqNo = await getPaymentRequestSeqNo(
      buyerUserData.telegramId,
      startNewSaleBody.name
    );

    // purchase with crypto
    const response = await request(app)
      .post(`/api/v1/${env}/sale/purchase-with-crypto`)
      .set('Accept', 'application/json')
      .set('Authorization', buyerJwtToken)
      .send(purchaseWithCryptoBody);

    expect(response.status).toEqual(201);
    expect(response.body.data.paymentUrl).toEqual(
      changellyCreatePaymentMockResponse.data.payment_url
    );

    const paymentRequest = await getBuyerOrder(seqNo);

    expect(paymentRequest).not.toBeNull();
    expect(paymentRequest!.code).toEqual(
      createPaymentCodeSync(
        buyerUserData.telegramId,
        startNewSaleBody.name,
        seqNo
      )
    );
    expect(paymentRequest!.amount).toEqual(purchaseWithCryptoBody.amount);
    expect(paymentRequest!.destination).toEqual(
      environment.changellyPaymentReceiver
    );

    expect(paymentRequest!.expireAt).toEqual(
      new Date(+expireAtSpy.mock.results.at(-1)!.value * 1000)
    );

    expect(paymentRequest!.price).toEqual(
      (
        await calculateOrderTotalPrice(
          startNewSaleBody.name,
          purchaseWithCryptoBody.amount
        )
      ).toNumber()
    );

    expect(paymentRequest!.telegramId).toEqual(buyerUserData.telegramId);
    expect(paymentRequest!.status).toEqual(PaymentRequestStatus.PENDING);
  });

  it('{/callback/changelly-crypto-api-callback} (SUCCESS): Validates user payment after user made a payment"', async () => {
    // generate Changelly API key pair mock
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    // mock private key
    jest
      .spyOn(environment, 'changellyCryptoCallbackPubKey', 'get')
      .mockReturnValue(
        publicKey
          .export({
            type: 'pkcs1',
            format: 'pem',
          })
          .toString('base64')
      );

    const expiration = changellyClientCrypto.getExpirationTimestampSeconds();

    const payload = Buffer.from(
      `${JSON.stringify(cryptoCallbackBody)}:${expiration}`
    );
    const callbackSignature = crypto
      .sign('RSA-SHA256', payload, privateKey)
      .toString('base64');

    const signatureHeader = Buffer.from(
      [callbackSignature, expiration].join(':')
    ).toString('base64');

    // purchase with crypto
    const response = await request(app)
      .post(`/api/v1/${env}/callback/changelly-crypto-api-callback`)
      .set('Accept', 'application/json')
      .set('X-Signature', signatureHeader)
      .send(cryptoCallbackBody);

    expect(response.status).toEqual(204);

    // check db
    const paymentRequest = await getBuyerOrder();

    expect(paymentRequest).not.toBeNull();
    expect(paymentRequest!.status).toEqual(PaymentRequestStatus.PAID);
  });

  it('{/callback/changelly-crypto-api-callback} (SUCCESS): Cancel user payment order if payment FAILED"', async () => {
    // TODO: Test ChangellyCryptoPaymentState.FAILED flow
  });

  it('{/callback/changelly-crypto-api-callback} (SUCCESS): Cancel user payment order if payment CANCELED"', async () => {
    // TODO: Test ChangellyCryptoPaymentState.CANCELED flow
  });
});
