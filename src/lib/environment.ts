import fs from 'fs';
import path from 'path';
import { config as configDotenv } from 'dotenv';
import { cleanEnv } from 'envalid';
import { EnvironmentFile, Environments } from '@/enums/environment.enum';
import envValidationConfig from '@/config/env-validation.config';
import { envFileNotFoundError } from '@/utils/helper';
import { type CommonEnvKeys } from '@/types/environment.type';
import appConfig from '@/config/app.config';

export interface IEnvironment {
  getCurrentEnvironment: () => string;
  setEnvironment: (env?: Environments) => void;
  isProd: () => boolean;
  isDev: () => boolean;
  isTest: () => boolean;
  isStage: () => boolean;
}

class Environment implements IEnvironment {
  private _port: number;
  private _env: Environments;
  private _appUrl: string;
  private _jwtSecret: string;
  private _jwtExpiresIn: number | string;
  private _apiAuthKeys: string[];
  private _botToken: string;
  private _bcryptSaltRounds: number;
  private _paymentRequestExpireIn: number | string;
  private _tonPaymentDestinationAddress: string;
  private _geckoApiKey: string;
  private _changellyFiatBaseUrl: string;
  private _changellyCryptoBaseUrl: string;
  private _changellyFiatApiKey: string;
  private _changellyFiatPrivKey: string;
  private _changellyFiatCallbackPubKey: string;
  private _changellyCryptoPrivKey: string;
  private _changellyCryptoPubKey: string;
  private _changellyCryptoCallbackPubKey: string;
  private _defaultCustomerEmail: string;
  private _changellyFeesPayer: string;
  private _changellyPaymentReceiver: string;
  private _changellySuccessUrl: string;
  private _changellyFailUrl: string;
  private _axiosTimeout: number;

  constructor() {
    this.port = +process.env.PORT ?? appConfig.defaultPort;
    this.setEnvironment(process.env.NODE_ENV ?? Environments.DEV);
  }

  get env() {
    return this._env;
  }

  set env(value) {
    this._env = value;
  }

  get port() {
    return this._port;
  }

  set port(value) {
    this._port = value;
  }

  get appUrl() {
    return this._appUrl;
  }

  set appUrl(value) {
    this._appUrl = value;
  }

  get jwtSecret() {
    return this._jwtSecret;
  }

  set jwtSecret(value) {
    this._jwtSecret = value;
  }

  get jwtExpiresIn() {
    return this._jwtExpiresIn;
  }

  set jwtExpiresIn(value) {
    this._jwtExpiresIn = value;
  }

  get apiAuthKeys() {
    return this._apiAuthKeys;
  }

  set apiAuthKeys(value) {
    this._apiAuthKeys = value;
  }

  get botToken() {
    return this._botToken;
  }

  set botToken(value) {
    this._botToken = value;
  }

  get bcryptSaltRounds() {
    return this._bcryptSaltRounds;
  }

  set bcryptSaltRounds(value) {
    this._bcryptSaltRounds = value;
  }

  get paymentRequestExpireIn() {
    return this._paymentRequestExpireIn;
  }

  set paymentRequestExpireIn(value) {
    this._paymentRequestExpireIn = value;
  }

  get tonPaymentDestinationAddress() {
    return this._tonPaymentDestinationAddress;
  }

  set tonPaymentDestinationAddress(value) {
    this._tonPaymentDestinationAddress = value;
  }

  get geckoApiKey() {
    return this._geckoApiKey;
  }

  set geckoApiKey(value) {
    this._geckoApiKey = value;
  }

  get changellyFiatPrivKey() {
    return this._changellyFiatPrivKey;
  }

  set changellyFiatPrivKey(value) {
    this._changellyFiatPrivKey = value;
  }

  get changellyFiatApiKey() {
    return this._changellyFiatApiKey;
  }

  set changellyFiatApiKey(value) {
    this._changellyFiatApiKey = value;
  }

  get changellyFiatCallbackPubKey() {
    return this._changellyFiatCallbackPubKey;
  }

  set changellyFiatCallbackPubKey(value) {
    this._changellyFiatCallbackPubKey = value;
  }

  get changellyCryptoPrivKey() {
    return this._changellyCryptoPrivKey;
  }

  set changellyCryptoPrivKey(value) {
    this._changellyCryptoPrivKey = value;
  }

  get changellyCryptoPubKey() {
    return this._changellyCryptoPubKey;
  }

  set changellyCryptoPubKey(value) {
    this._changellyCryptoPubKey = value;
  }

  get changellyCryptoCallbackPubKey() {
    return this._changellyCryptoCallbackPubKey;
  }

  set changellyCryptoCallbackPubKey(value) {
    this._changellyCryptoCallbackPubKey = value;
  }

  get changellyFiatBaseUrl() {
    return this._changellyFiatBaseUrl;
  }

  set changellyFiatBaseUrl(value) {
    this._changellyFiatBaseUrl = value;
  }

  get changellyCryptoBaseUrl() {
    return this._changellyCryptoBaseUrl;
  }

  set changellyCryptoBaseUrl(value) {
    this._changellyCryptoBaseUrl = value;
  }

  get defaultCustomerEmail() {
    return this._defaultCustomerEmail;
  }

  set defaultCustomerEmail(value) {
    this._defaultCustomerEmail = value;
  }

  get changellyFeesPayer() {
    return this._changellyFeesPayer;
  }

  set changellyFeesPayer(value) {
    this._changellyFeesPayer = value;
  }

  get changellyPaymentReceiver() {
    return this._changellyPaymentReceiver;
  }

  set changellyPaymentReceiver(value) {
    this._changellyPaymentReceiver = value;
  }

  get changellySuccessUrl() {
    return this._changellySuccessUrl;
  }

  set changellySuccessUrl(value) {
    this._changellySuccessUrl = value;
  }

  get changellyFailUrl() {
    return this._changellyFailUrl;
  }

  set changellyFailUrl(value) {
    this._changellyFailUrl = value;
  }

  get axiosTimeout() {
    return this._axiosTimeout;
  }

  set axiosTimeout(value) {
    this._axiosTimeout = value;
  }

  private resolveEnvPath(key: CommonEnvKeys): string {
    // On priority bar, .env.[NODE_ENV] has higher priority than default env file (.env)
    // If both are not resolved, error is thrown.
    const rootDir: string = path.resolve(__dirname, '../../');
    const envPath = path.resolve(rootDir, EnvironmentFile[key]);
    const defaultEnvPath = path.resolve(rootDir, EnvironmentFile.DEFAULT);
    if (!fs.existsSync(envPath) && !fs.existsSync(defaultEnvPath)) {
      throw new Error(envFileNotFoundError(key));
    }
    return fs.existsSync(envPath) ? envPath : defaultEnvPath;
  }

  private validateEnvValues() {
    const env = cleanEnv(process.env, envValidationConfig);
    this.port = env.PORT;
    this.appUrl = env.APP_BASE_URL;
    this.jwtSecret = env.JWT_SECRET;
    this.jwtExpiresIn = env.JWT_EXPIRES_IN;
    this.apiAuthKeys = env.API_AUTH_KEYS?.split(',');
    this.botToken = env.BOT_TOKEN;
    this.bcryptSaltRounds = env.BCRYPT_SALT_ROUNDS;
    this.paymentRequestExpireIn = env.PAYMENT_REQUEST_EXPIRE_IN;
    this.tonPaymentDestinationAddress = env.TON_PAYMENT_DESTINATION_ADDRESS;
    this.geckoApiKey = env.GECKO_API_KEY;
    this.changellyFiatBaseUrl = env.CHANGELLY_FIAT_BASE_URL;
    this.changellyCryptoBaseUrl = env.CHANGELLY_CRYPTO_BASE_URL;
    this.changellyFiatApiKey = env.CHANGELLY_FIAT_API_KEY;
    this.changellyFiatPrivKey = env.CHANGELLY_FIAT_PRIV_KEY;
    this.changellyFiatCallbackPubKey = env.CHANGELLY_FIAT_CALLBACK_PUB_KEY;
    this.changellyCryptoPrivKey = env.CHANGELLY_CRYPTO_PRIV_KEY;
    this.changellyCryptoPubKey = env.CHANGELLY_CRYPTO_PUB_KEY;
    this.changellyCryptoCallbackPubKey = env.CHANGELLY_CRYPTO_CALLBACK_PUB_KEY;
    this.defaultCustomerEmail = env.DEFAULT_CUSTOMER_EMAIL;
    this.changellyFeesPayer = env.CHANGELLY_FEES_PAYER;
    this.changellyPaymentReceiver = env.CHANGELLY_PAYMENT_RECEIVER;
    this.changellySuccessUrl = env.CHANGELLY_SUCCESS_URL;
    this.changellyFailUrl = env.CHANGELLY_FAIL_URL;
    this.axiosTimeout = env.AXIOS_TIMEOUT;
  }

  public setEnvironment(env = Environments.DEV): void {
    this.env = env;

    const envKey = Object.keys(Environments).find(
      (key) => Environments[key] === this.env
    ) as keyof typeof Environments;
    const envPath = this.resolveEnvPath(envKey);

    configDotenv({ path: envPath });
    this.validateEnvValues();
  }

  public getCurrentEnvironment() {
    return this.env;
  }

  public isProd() {
    return this.env === Environments.PRODUCTION;
  }

  public isDev() {
    return this.env === Environments.DEV;
  }

  public isStage() {
    return this.env === Environments.STAGING;
  }

  public isTest() {
    return this.env === Environments.TEST;
  }
}

export { Environment };
export default new Environment();
