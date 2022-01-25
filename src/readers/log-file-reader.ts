import * as LineByLine from 'n-readlines';
import { Log } from '../models/log';
import { ObserverEvents } from '../models/observer-events';
import { Config } from '../config';
import { RegexException } from '../exceptions/regex-exception';
import { ParsingDateException } from '../exceptions/parsing-date-exception';
import { ParsingTransactionDetailException } from '../exceptions/parsing-transaction-detail-exception';
import { ParsingLogLevelException } from '../exceptions/parsing-log-level-exception';
import { Reader } from './reader';

export class LogFileReader extends Reader {
  constructor(private readonly config: Config) {
    super();
  }

  private static parse(rawData: Buffer): string[] {
    const regex =
      /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+Z) - (error|info|warn|debug) - ({.*})/;
    try {
      const parts = rawData
        .toString()
        .split(regex)
        .filter((part) => part !== '');
      if (!parts || parts.length !== 3) throw new Error('Log parsing error!');
      return parts;
    } catch (e) {
      throw new RegexException(e.message, rawData.toString());
    }
  }

  public read(path: string, filter: string[]): void {
    const readStreamByLine = new LineByLine(path);
    let line;
    // Publishing this message to prepare observers
    this.publish(ObserverEvents.START);

    // generator kullanabilir.
    // Stream file line by line to not keep in memory
    while ((line = readStreamByLine.next())) {
      try {
        const logParts: string[] = LogFileReader.parse(line);
        const log: Log = this.convertToLog(logParts);

        // Emit log data with observers.
        // logs will be exported as json by json-exporter
        if (filter.includes(log.loglevel)) this.publish(JSON.stringify(log));
      } catch (err) {
        //
        this.publish(ObserverEvents.ERROR);
        console.error(err.payload, `${err.message}. Line: ${line.toString()}`);
      }
    }
    // Publishing this message to inform observers
    this.publish(ObserverEvents.END);
  }

  private convertToLog(logItems: string[]): Log {
    let timestamp, loglevel, transactionId, transactionDetail, err;

    if (logItems.length !== 3)
      throw new RegexException(
        'Length of parsed log items, is not equal to 3',
        logItems,
      );

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
