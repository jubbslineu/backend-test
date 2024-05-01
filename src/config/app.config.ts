import {
  DEFAULT_PORT,
  DEFAULT_JWT_EXPIRES_IN,
  DEFAULT_BCRYPT_SALT_ROUNDS,
  PAYMENT_REQUEST_EXPIRE_IN,
  CHANGELLY_FIAT_BASE_URL,
  CHANGELLY_CRYPTO_BASE_URL,
  AXIOS_TIMEOUT,
  SIGNATURE_EXPIRES_IN,
  REGISTER_TON_ADDRESS_PAYLOAD_TEMPLATE,
} from '@/utils/constants';

interface AppConfig {
  api: {
    /**
     * Api base path
     */
    basePath: string;

    /**
     * Api version
     */
    version: string;
  };
  docs: {
    /**
     * Swagger ui path
     */
    swaggerUIPath: string;

    /**
     * Open api specs path
     */
    apiDocsPath: string;
  };
  logs: {
    /**
     * Folder where log files would be saved
     */
    dir: string;

    /**
     * File name in which the combined logs of app would be written
     */
    logFile: string;

    /**
     * File name of error logs
     */
    errorLogFile: string;
  };
  defaultPort: number;
  defaultJwtExpiresIn: number;
  defaultApiAuthKeys: string;
  defaultBcryptSaltRounds: number;
  paymentRequestExpirein: number;
  changellyFiatBaseUrl: string;
  changellyCryptoBaseUrl: string;
  axiosTimeout: number;
  signatureExpiresIn: number;
  registerTonAddressPayloadTemplate: string;
}

const appConfig: AppConfig = {
  api: {
    basePath: 'api',
    version: 'v1',
  },
  docs: {
    swaggerUIPath: '/v1/swagger',
    apiDocsPath: '/v1/api-docs',
  },
  logs: {
    dir: './logs',
    logFile: 'app.log',
    errorLogFile: 'error.log',
  },
  defaultPort: DEFAULT_PORT,
  defaultJwtExpiresIn: DEFAULT_JWT_EXPIRES_IN,
  defaultApiAuthKeys: 'api-key,secret-key',
  defaultBcryptSaltRounds: DEFAULT_BCRYPT_SALT_ROUNDS,
  paymentRequestExpirein: PAYMENT_REQUEST_EXPIRE_IN,
  changellyFiatBaseUrl: CHANGELLY_FIAT_BASE_URL,
  changellyCryptoBaseUrl: CHANGELLY_CRYPTO_BASE_URL,
  axiosTimeout: AXIOS_TIMEOUT,
  signatureExpiresIn: SIGNATURE_EXPIRES_IN,
  registerTonAddressPayloadTemplate: REGISTER_TON_ADDRESS_PAYLOAD_TEMPLATE,
};

export default appConfig;
