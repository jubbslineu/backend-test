import crypto from 'crypto';
import axios, { type Axios } from 'axios';
import { HttpInternalServerError } from './errors';
import environment from './environment';
import {
  ChangellyErrorType,
  ChangellyErrorReason,
} from '@/types/changelly-api.type';

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  PATCH = 'patch',
  DELETE = 'delete',
}

export enum ApiOptions {
  FIAT = 'FIAT',
  CRYPTO = 'CRYPTO',
}

export enum CryptoEndpoints {
  CreatePayment = '/payments',
  GetPayment = '/payments/{{paymentId}}',
}

// TODO: Add Fiat API endpoints here
export enum FiatEndpoints {}

// Add Endpoint => Method mappings here
const endpointMapping = {
  [ApiOptions.CRYPTO]: {
    [CryptoEndpoints.CreatePayment]: HttpMethod.POST,
    [CryptoEndpoints.GetPayment]: HttpMethod.GET,
  },
  [ApiOptions.FIAT]: {},
};

type ChangellyEndpoint = CryptoEndpoints | FiatEndpoints;

type OptionType = ApiOptions | ChangellyEndpoint;

interface SignPayloadResult {
  expiration: number;
  signature: string;
}

interface ChangellyApiResponse {
  data: any;
  expiration: number;
}

const wrapRsaPrivateKey = (rsaPrivKey: string): string => {
  return `
-----BEGIN PRIVATE KEY-----
${rsaPrivKey}
-----END PRIVATE KEY-----
`;
};

const wrapRsaPublicKey = (rsaPubKey: string): string => {
  return `
-----BEGIN PUBLIC KEY-----
${rsaPubKey}
-----END PUBLIC KEY-----
`;
};

const signPayloadCrypto = (
  method: HttpMethod,
  body: object,
  path: string,
  expiration: number
): SignPayloadResult => {
  const bodyJson = JSON.stringify(body);
  path = (path.startsWith('/') ? path : `/${path}`).replace(/\/$/, '');

  const bodyBase64 =
    bodyJson !== '{}' ? Buffer.from(bodyJson).toString('base64') : '';
  const payload = [method.toString(), path, bodyBase64, expiration].join(':');

  const signature = Buffer.from(
    [
      crypto.sign(
        'RSA-SHA256',
        new TextEncoder().encode(payload),
        wrapRsaPrivateKey(environment.changellyCryptoPrivKey)
      ),
      expiration,
    ].join(':')
  ).toString('base64');

  return {
    expiration,
    signature,
  };
};

const signPayloadFiat = (
  body: object,
  path: string,
  expiration: number
): SignPayloadResult => {
  const bodyJson = JSON.stringify(body);
  path = new URL(
    path.replace(/\/$/, ''),
    environment.changellyFiatBaseUrl
  ).toString();

  const payload = path + (bodyJson !== '{}' ? bodyJson : '');

  const privKeyObj = crypto.createPrivateKey({
    key: environment.changellyFiatPrivKey,
    type: 'pkcs1',
    format: 'pem',
    encoding: 'base64',
  });

  const signature = crypto
    .sign('SHA256', Buffer.from(payload), privKeyObj)
    .toString('base64');

  return {
    expiration,
    signature,
  };
};

const verifyCallbackSignatureCrypto = (
  body: object,
  signatureHeader?: string
): boolean => {
  if (!signatureHeader) {
    throw new HttpInternalServerError('CRYPTO callback verifycation failed', [
      ChangellyErrorType.BAD_REQUEST,
      ChangellyErrorReason.INVALID_REQUEST_HEADER,
      'Signature missing',
      'X-Callback-Signature',
    ]);
  }

  const [signature, expiration] = Buffer.from(signatureHeader, 'base64')
    .toString('utf8')
    .split(':');

  const signatureBuffer = Buffer.from(signature, 'base64');

  const payload = Buffer.from(`${JSON.stringify(body)}:${expiration}`);

  return crypto.verify(
    'RSA-SHA256',
    payload,
    wrapRsaPublicKey(environment.changellyCryptoCallbackPubKey),
    signatureBuffer
  );
};

const verifyCallbackSignatureFiat = (
  body: any & { orderId: string },
  signatureHeader?: string,
  apiKeyHeader?: string
): boolean => {
  if (!signatureHeader) {
    throw new HttpInternalServerError('FIAT callback verifycation failed', [
      ChangellyErrorType.BAD_REQUEST,
      ChangellyErrorReason.INVALID_REQUEST_HEADER,
      'Signature missing',
      'X-Callback-Signature',
    ]);
  }

  if (apiKeyHeader !== environment.changellyFiatApiKey) {
    throw new HttpInternalServerError('FIAT callback verifycation failed', [
      ChangellyErrorType.BAD_REQUEST,
      ChangellyErrorReason.INVALID_REQUEST_HEADER,
      'Callback Api key mismatch',
      'X-Callback-Api-Key',
    ]);
  }

  const signaturePayload = Buffer.from(
    JSON.stringify({ orderId: body.orderId })
  );
  const signatureBuffer = Buffer.from(signatureHeader, 'base64');

  const pubKeyObj = crypto.createPublicKey({
    key: environment.changellyFiatCallbackPubKey,
    type: 'pkcs1',
    format: 'pem',
    encoding: 'base64',
  });

  return crypto.verify('SHA256', signaturePayload, pubKeyObj, signatureBuffer);
};

export const verifyCallbackSignature = (
  apiOption: ApiOptions,
  body: Record<string, string>,
  header: Record<string, string>
): boolean => {
  return switchApiOptions({
    [ApiOptions.CRYPTO]: () =>
      verifyCallbackSignatureCrypto(body, header['X-Signature']),
    [ApiOptions.FIAT]: () =>
      verifyCallbackSignatureFiat(
        body,
        header['X-Callback-Signature'],
        header['X-Callback-Api-Key']
      ),
  })[apiOption];
};

const switchOptions = <E extends OptionType, T>(
  optionsEnum: E,
  actions: Record<E, T>,
  params?: Record<E, any[]>
): Record<string, T> => {
  const enumOptions = Object.keys(optionsEnum);
  return new Proxy(
    Object.fromEntries(
      enumOptions.map((option) => {
        return [option, actions[option]];
      })
    ),
    {
      get: function (target, key) {
        if (!Reflect.has(target, key)) {
          throw new HttpInternalServerError('Changelly Client error', [
            `Invalid option key: ${key as string}`,
            `Target type: ${typeof optionsEnum}`,
          ]);
        }

        const targetValue = Reflect.get(target, key);
        if (typeof targetValue === 'function') {
          return targetValue(...(params ? params[key] : []));
        }

        return targetValue;
      },
    }
  );
};

const switchApiOptions = switchOptions.bind(undefined, Object(ApiOptions));
const switchCryptoEndpoints = switchOptions.bind(
  undefined,
  Object(CryptoEndpoints)
);

const switchFiatEndpoints = switchOptions.bind(
  undefined,
  Object(FiatEndpoints)
);

export class ChangellyClient {
  private readonly _client: Axios;
  private readonly _apiOption: ApiOptions;
  private _expireInterval: string;
  private readonly _getEndpointMethod: (
    endpoint: ChangellyEndpoint
  ) => HttpMethod;

  private readonly _signPayload: (
    method: HttpMethod,
    body: object,
    path: string
  ) => SignPayloadResult;

  private readonly _initialHeader: Record<string, string>;

  constructor(
    apiOption: ApiOptions,
    timeout: number = environment.axiosTimeout,
    headers = ChangellyClient._getInitialHeader(apiOption),
    expireInterval = environment.paymentRequestExpireIn
  ) {
    this._client = axios.create({
      baseURL: ChangellyClient._getBaseUrl(apiOption),
      timeout,
      headers,
    });
    this._apiOption = apiOption;
    this._getEndpointMethod = ChangellyClient._getEndpointMethod.bind(
      undefined,
      this._apiOption
    );
    this._signPayload = ChangellyClient._signPayload.bind(
      undefined,
      this._apiOption,
      this.getExpirationTimestampSeconds
    );
    this._initialHeader = headers;
    this._expireInterval = expireInterval.toString();
  }

  get apiOption() {
    return this._apiOption;
  }

  get expireInterval() {
    return this._expireInterval;
  }

  set expireInterval(value) {
    this._expireInterval = value;
  }

  public getExpirationTimestampSeconds(): number {
    return Date.now() / 1000 + +this.expireInterval;
  }

  public async fetch(
    endpoint: ChangellyEndpoint,
    body?: object,
    pathParams?: object
  ): Promise<ChangellyApiResponse> {
    const method = this._getEndpointMethod(endpoint);
    const { expiration, signature } = this._signPayload(
      method,
      body ?? {},
      endpoint.toString()
    );

    const response = await (async () => {
      try {
        return await this._client.request({
          url: ChangellyClient._substitutePathParam(
            endpoint.toString(),
            pathParams ?? {}
          ),
          method,
          data: body,
          headers: this._composeHeader(method, signature),
        });
      } catch (e) {
        throw new HttpInternalServerError('Changelly API request failed', [
          e.message,
        ]);
      }
    })();

    return {
      data: response.data,
      expiration,
    };
  }

  private _composeHeader(method: HttpMethod, signature: string) {
    const header = this._initialHeader;
    if (method !== HttpMethod.GET) {
      Object.assign(header, { 'Content-Type': 'application/json' });
    }

    Object.assign(
      header,
      switchApiOptions({
        [ApiOptions.CRYPTO]: { 'X-Signature': signature },
        [ApiOptions.FIAT]: { 'X-Api-Signature': signature },
      })[this.apiOption]
    );

    return header;
  }

  private static _getBaseUrl(apiOption: ApiOptions) {
    return switchApiOptions({
      [ApiOptions.CRYPTO]: environment.changellyCryptoBaseUrl,
      [ApiOptions.FIAT]: environment.changellyFiatBaseUrl,
    })[apiOption];
  }

  private static _getInitialHeader(apiOption: ApiOptions) {
    return {
      'X-Api-Key': switchApiOptions({
        [ApiOptions.CRYPTO]: environment.changellyCryptoPubKey,
        [ApiOptions.FIAT]: environment.changellyFiatApiKey,
      })[apiOption],
    };
  }

  private static _signPayload(
    apiOption: ApiOptions,
    method: HttpMethod,
    body: object,
    path: string,
    expiration: () => number
  ): SignPayloadResult {
    return switchApiOptions({
      [ApiOptions.CRYPTO]: () =>
        signPayloadCrypto(method, body, path, expiration()),
      [ApiOptions.FIAT]: () => signPayloadFiat(body, path, expiration()),
    })[apiOption];
  }

  private static _getEndpointMethod(
    apiOption: ApiOptions,
    endpoint: ChangellyEndpoint
  ): HttpMethod {
    return switchApiOptions({
      [ApiOptions.CRYPTO]: () =>
        switchCryptoEndpoints(endpointMapping[ApiOptions.CRYPTO])[endpoint],
      [ApiOptions.FIAT]: () =>
        switchFiatEndpoints(endpointMapping[ApiOptions.FIAT])[endpoint],
    })[apiOption];
  }

  private static _substitutePathParam(
    path: string,
    pathParams: object
  ): string {
    Object.entries(pathParams).forEach(([name, value]) => {
      path = path.replace(`{{${name}}}`, value);
    });

    if (path.match(/{{\w+}}/g)) {
      throw new HttpInternalServerError('Changelly Client error', [
        'Missing path parameters',
      ]);
    }

    return path;
  }
}
