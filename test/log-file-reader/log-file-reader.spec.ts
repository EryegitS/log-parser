import { Config } from '../../src/config';
import { LogFileReader } from '../../src/readers/log-file-reader';
import { Log, LogLevels } from '../../src/models/log';
import { ParsingDateException } from '../../src/exceptions/parsing-date-exception';
import { ParsingLogLevelException } from '../../src/exceptions/parsing-log-level-exception';
import { ParsingTransactionDetailException } from '../../src/exceptions/parsing-transaction-detail-exception';
import { RegexException } from '../../src/exceptions/regex-exception';
import { Exporter } from '../../src/exporters/exporter';
import { ObserverEvents } from '../../src/models/observer-events';
import * as fs from 'fs';

describe('Log File features unit tests', () => {
  const config = new Config();
  const logFileReader = new LogFileReader(config);

  const path = './test.log';
  const errorLog =
    '2021-08-09T02:12:51.259Z - error - {"transactionId":"9abc55b2-807b-4361-9dbe-aa88b1b2e978","details":"Cannot find user orders list","code": 404,"err":"Not found"}';
  const debugLog =
    '2021-08-09T03:12:51.259Z - debug - {"transactionId":"9abc55b2-807b-4361-9dbe-aa88b1b2e821","details":"User information is retrieved","user": {"id": 16, "name": "Michael"}}';

  it('should parse error log successfully', () => {
    /******* GIVEN ******/
    const parsedLog = [
      '2021-08-09T02:12:51.259Z',
      'error',
      '{"transactionId":"9abc55b2-807b-4361-9dbe-aa88b1b2e978","details":"Cannot find user orders list","code": 404,"err":"Not found"}',
    ];
    /******* WHEN ******/
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const logParts: string[] = LogFileReader.parse(Buffer.from(errorLog));

    /******* THEN ******/
    logParts.forEach((part, i) => {
      expect(logParts[i]).toBe(parsedLog[i]);
    });
  });

  it('should convert parsed error log successfully', () => {
    /******* GIVEN ******/
    const parsedLog = [
      '2021-08-09T02:12:51.259Z',
      'error',
      '{"transactionId":"9abc55b2-807b-4361-9dbe-aa88b1b2e978","details":"Cannot find user orders list","code": 404,"err":"Not found"}',
    ];
    /******* WHEN ******/
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const log: Log = logFileReader.convertToLog(parsedLog);

    /******* THEN ******/
    expect(log.loglevel).toBe('error');
    expect(log.timestamp).toBe(new Date(errorLog.split(' - ')[0]).getTime());
    expect(log.transactionId).toBe('9abc55b2-807b-4361-9dbe-aa88b1b2e978');
    expect(log.err).toBe('Not found');
  });

  it('should throw error if log format is not proper', () => {
    /******* GIVEN ******/
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const log1 = LogFileReader.parse(Buffer.from(errorLog));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const log2 = LogFileReader.parse(Buffer.from(errorLog));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const log3 = LogFileReader.parse(Buffer.from(errorLog));
    const log4 = [];

    /******* WHEN ******/
    log1[0] = 'test'; //date
    log2[1] = '';
    log3[2] = '{}';

    /******* THEN ******/
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      logFileReader.convertToLog(log1);
    }).toThrow(ParsingDateException);
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      logFileReader.convertToLog(log2);
    }).toThrow(ParsingLogLevelException);
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      logFileReader.convertToLog(log3);
    }).toThrow(ParsingTransactionDetailException);
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      logFileReader.convertToLog(log4);
    }).toThrow(RegexException);
  });

  it('should filter and emit error log to observers', async () => {
    /******* GIVEN ******/
    const observer = new Exporter();

    /******* WHEN ******/
    const data = errorLog + '\n' + debugLog;
    fs.writeFileSync(path, data);

    logFileReader.subscribe(observer);
    logFileReader.read(path, [LogLevels.ERROR]);

    /******* THEN ******/
    const log = JSON.parse(observer.messages[1]);
    expect(log.loglevel).toBe(LogLevels.ERROR);
    expect(log.transactionId).toBe('9abc55b2-807b-4361-9dbe-aa88b1b2e978');
    expect(log.timestamp).toBe(new Date('2021-08-09T02:12:51.259Z').getTime());
    expect(observer.messages[0]).toBe(ObserverEvents.START);
    expect(observer.messages[2]).toBe(ObserverEvents.END);
  });

  it('should filter and consume debug log from observers', async () => {
    /******* GIVEN ******/
    const observer = new Exporter();

    /******* WHEN ******/
    const data = errorLog + '\n' + debugLog;
    fs.writeFileSync(path, data);

    logFileReader.subscribe(observer);
    logFileReader.read(path, [LogLevels.DEBUG]);

    /******* THEN ******/
    const log = JSON.parse(observer.messages[1]);
    expect(log.loglevel).toBe(LogLevels.DEBUG);
    expect(log.transactionId).toBe('9abc55b2-807b-4361-9dbe-aa88b1b2e821');
    expect(log.timestamp).toBe(new Date('2021-08-09T03:12:51.259Z').getTime());
    expect(observer.messages[0]).toBe(ObserverEvents.START);
    expect(observer.messages[2]).toBe(ObserverEvents.END);
  });
});
