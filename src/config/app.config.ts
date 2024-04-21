import {
  DEFAULT_PORT,
  DEFAULT_JWT_EXPIRES_IN,
  DEFAULT_BCRYPT_SALT_ROUNDS,
  PAYMENT_REQUEST_EXPIRE_IN,
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
};

export default appConfig;
