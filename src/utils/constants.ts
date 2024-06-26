export const LOG_DIR = './logs';
export const LOG_DATE_FORMAT = 'MM-DD-YYYY HH:MM:SS';
export const DEFAULT_PORT = 5000;
export const DEFAULT_JWT_EXPIRES_IN = 86400;
export const DEFAULT_BCRYPT_SALT_ROUNDS = 10;
export const PAYMENT_REQUEST_EXPIRE_IN = 3600; // 1 hour
export const CHANGELLY_FIAT_BASE_URL = 'https://fiat-api.changelly.com';
export const CHANGELLY_CRYPTO_BASE_URL = 'https://api.pay.changelly.com';
export const AXIOS_TIMEOUT = 15000;
export const SIGNATURE_EXPIRES_IN = 600; // 10 min
export const REGISTER_TON_ADDRESS_PAYLOAD_TEMPLATE =
  'Authorize changing account address to ${address} (nonce: ${nonce})';
