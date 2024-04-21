import { str, num } from 'envalid';
import appConfig from './app.config';
import { Environments } from '@/enums/environment.enum';

const envValidationConfig = {
  NODE_ENV: str({
    default: Environments.DEV,
    choices: [...Object.values(Environments)],
  }),
  PORT: num({ default: appConfig.defaultPort }),
  APP_BASE_URL: str(),
  DATABASE_URL: str(),
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: num({ default: appConfig.defaultJwtExpiresIn }),
  API_AUTH_KEYS: str(),
  BOT_TOKEN: str(),
  BCRYPT_SALT_ROUNDS: num({ default: appConfig.defaultBcryptSaltRounds }),
  PAYMENT_REQUEST_EXPIRE_IN: num({ default: appConfig.paymentRequestExpirein }),
  TON_PAYMENT_DESTINATION_ADDRESS: str(),
  GECKO_API_KEY: str(),
};

export default envValidationConfig;
