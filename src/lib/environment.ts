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
