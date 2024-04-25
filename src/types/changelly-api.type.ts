export enum ChangellyCryptoPaymentState {
  CANCELED = 'CANCELED',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
}

export enum ChangellyErrorType {
  BAD_REQUEST = 'BAD_REQUEST',
  API_ERROR = 'API_ERROR',
}

export enum ChangellyErrorReason {
  INVALID_REQUEST_PARAMETERS = 'INVALID_REQUEST_PARAMETERS',
  INVALID_REQUEST_BODY = 'INVALID_REQUEST_BODY',
  INVALID_REQUEST_HEADER = 'INVALID_REQUEST_HEADER',
  INVALID_REQUEST = 'INVALID_REQUEST',
  REQUEST_TIMED_OUT = 'REQUEST_TIMED_OUT',
  NOMINAL_AMOUNT_INVALID = 'NOMINAL_AMOUNT_INVALID',
  PAYMENT_METHOD_NOT_ALLOWED = 'PAYMENT_METHOD_NOT_ALLOWED',
  DATA_NOT_SYNCED = 'DATA_NOT_SYNCED',
  INTERNAL_UNKNOWN = 'INTERNAL_UNKNOWN',
}

export interface ChangellyCryptoPaymentCallbackBody {
  payment_id: string;
  order_id?: string;
  customer_id?: string;
  customer_email?: string;
  state: ChangellyCryptoPaymentState;
  updated_at: string;
}

export enum ChangellyFiatPaymentStatus {
  CREATED = 'created',
  PENDING = 'pending',
  HOLD = 'hold',
  REFUNDED = 'refunded',
  EXPIRED = 'expired',
  FAILED = 'failed',
  COMPLETE = 'complete',
}

export enum ChangellyFiatProviderCode {
  MOONPAY = 'moonpay',
  BANXA = 'banxa',
  WERT = 'wert',
}

export enum ChangellyFiatPaymentMethod {
  CARD = 'card',
  SEPA_BANK_TRANSFER = 'sepa_bank_transfer',
}

export interface ChangellyFiatPaymentCallbackBody {
  redirectUrl?: string;
  order_id: string;
  status: ChangellyFiatPaymentStatus;
  externalUserId?: string;
  externalOrderId?: string;
  providerCode: ChangellyFiatProviderCode;
  currencyFrom: string;
  currencyTo: string;
  amountFrom: string;
  country?: string;
  state?: string;
  ip?: string;
  walletAddress: string;
  walletExtraId?: string;
  paymentMethod: ChangellyFiatPaymentMethod;
  userAgent?: string;
  metadata?: any;
  createdAt: string;
  payinAmount: string;
  payoutAmount: string;
  payinCurrency: string;
  payoutCurrency: string;
}
