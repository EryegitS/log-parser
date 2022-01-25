export enum LogLevels {
  ERROR = 'error',
  WARNING = 'warning',
  DEBUG = 'debug',
  INFO = 'info',
}

export interface Log {
  timestamp: number;
  loglevel: string;
  transactionId: string;
  err: string;
}
