import * as LineByLine from 'n-readlines';
import { Log } from '../models/log';
import { ObserverEvents } from '../models/observer-events';
import { Config } from '../config';
import { DelimiterException } from '../exceptions/delimiter-exception';
import { ParsingDateException } from '../exceptions/parsing-date-exception';
import { ParsingTransactionDetailException } from '../exceptions/parsing-transaction-detail-exception';
import { ParsingLogLevelException } from '../exceptions/parsing-log-level-exception';
import { Reader } from './reader';

export class LogFileReader extends Reader {
  delimiter: string;

  constructor(private readonly config: Config, delimiter: string) {
    super();
    this.delimiter = delimiter;
  }

  private parse(rawData: Buffer): Log {
    return this.validation(rawData.toString().split(this.delimiter));
  }

  public read(path: string, filter: string[]): void {
    const readStreamByLine = new LineByLine(path);
    let line;
    this.publish(ObserverEvents.START);
    while ((line = readStreamByLine.next())) {
      try {
        const log: Log = this.parse(line);
        if (filter.includes(log.loglevel)) this.publish(JSON.stringify(log));
      } catch (err) {
        console.error(err.payload, `${err.message}. Line: ${line.toString()}`);
      }
    }
    this.publish(ObserverEvents.END);
  }

  private validation(logItems: string[]): Log {
    let timestamp, loglevel, transactionId, transactionDetail, err;
    if (logItems.length !== 3) throw new DelimiterException(logItems);
    // validate date item
    try {
      this.config.validateDate(logItems[0]);
      timestamp = new Date(logItems[0]).getTime();
    } catch (e) {
      throw new ParsingDateException(logItems[0], e.message);
    }
    // validate transaction details
    try {
      transactionDetail = JSON.parse(logItems[2]);
      this.config.validateTransactionDetail(transactionDetail);
      transactionId = transactionDetail.transactionId;
      err = transactionDetail.err;
    } catch (e) {
      throw new ParsingTransactionDetailException(logItems[2], e.message);
    }
    // validate transaction log level
    try {
      this.config.validateLogLevel(logItems[1]);
      loglevel = logItems[1];
    } catch (e) {
      throw new ParsingLogLevelException(logItems[1], e.message);
    }

    return {
      timestamp,
      loglevel,
      transactionId,
      err,
    } as Log;
  }
}
