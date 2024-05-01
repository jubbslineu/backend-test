import { str, num, email, url, makeValidator } from 'envalid';
import appConfig from './app.config';
import { Environments } from '@/enums/environment.enum';

const registerTonAddressPayloadRegex =
  /^.*(?:\$\{address\}.*\$\{nonce\}|\$\{nonce\}.*\$\{address\}).*$/;

const registerTonAddressPayload = makeValidator<string>((input: string) => {
  if (!registerTonAddressPayloadRegex.exec(input)) {
    throw new Error('Invalid REGISTER_TON_ADDRESS_PAYLOAD_TEMPLATE env var');
  }
  return input;
});

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
  CHANGELLY_FIAT_BASE_URL: str({ default: appConfig.changellyFiatBaseUrl }),
  CHANGELLY_CRYPTO_BASE_URL: str({
    default: appConfig.changellyCryptoBaseUrl,
  }),
  CHANGELLY_FIAT_API_KEY: str(),
  CHANGELLY_FIAT_PRIV_KEY: str(),
  CHANGELLY_FIAT_CALLBACK_PUB_KEY: str(),
  CHANGELLY_CRYPTO_PRIV_KEY: str(),
  CHANGELLY_CRYPTO_PUB_KEY: str(),
  CHANGELLY_CRYPTO_CALLBACK_PUB_KEY: str(),
  DEFAULT_CUSTOMER_EMAIL: email(),
  CHANGELLY_FEES_PAYER: str({ choices: ['MERCHANT', 'CUSTOMER'] }),
  CHANGELLY_PAYMENT_RECEIVER: str(),
  CHANGELLY_SUCCESS_URL: url(),
  CHANGELLY_FAIL_URL: url(),
  AXIOS_TIMEOUT: num({ default: appConfig.axiosTimeout }),
  SIGNATURE_EXPIRES_IN: num({ default: appConfig.signatureExpiresIn }),
  REGISTER_TON_ADDRESS_PAYLOAD_TEMPLATE: registerTonAddressPayload({
    default: appConfig.registerTonAddressPayloadTemplate,
  }),
};

export default envValidationConfig;
