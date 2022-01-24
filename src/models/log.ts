// <ISO Date> - <Log Level> - {"transactionId: "<UUID>", "details": "<message event/action description>", "err": "<Optionall, error description>", ...<additional log information>}
// [{"timestamp": <Epoch Unix Timestamp>, "loglevel": "<loglevel>", "transactionId: "<UUID>", "err": "<Error message>" }]
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
