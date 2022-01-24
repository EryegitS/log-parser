import { Config } from '../../src/config';
import { LogFileReader } from '../../src/readers/log-file-reader';
import { Log, LogLevels } from '../../src/models/log';
import { ParsingDateException } from '../../src/exceptions/parsing-date-exception';
import { ParsingLogLevelException } from '../../src/exceptions/parsing-log-level-exception';
import { ParsingTransactionDetailException } from '../../src/exceptions/parsing-transaction-detail-exception';
import { DelimiterException } from '../../src/exceptions/delimiter-exception';
import { Consumer } from '../../src/consumers/consumer';
import { ObserverEvents } from '../../src/models/observer-events';
import * as fs from 'fs';

describe('Log File features unit tests', () => {
  const delimiter = ' - ';
  const config = new Config();
  const reader = new LogFileReader(config, delimiter);

  const path = './test.log';
  const errorLog =
    '2021-08-09T02:12:51.259Z - error - {"transactionId":"9abc55b2-807b-4361-9dbe-aa88b1b2e978","details":"Cannot find user orders list","code": 404,"err":"Not found"}';
  const debugLog =
    '2021-08-09T02:12:51.259Z - debug - {"transactionId":"9abc55b2-807b-4361-9dbe-aa88b1b2e821","details":"User information is retrieved","user": {"id": 16, "name": "Michael"}}';

  it('should filter and emit error log to observers', async () => {
    // given
    const observer = new Consumer();

    // when
    const data = errorLog + '\n' + debugLog;
    fs.writeFileSync(path, data);
    // writeStream.write(errorLog);
    // writeStream.write('\n' + debugLog);

    reader.subscribe(observer);
    reader.read(path, [LogLevels.ERROR]);

    // then
    console.log(observer.messages[1]);
    const parsedLog = JSON.parse(observer.messages[1]);
    expect(parsedLog.loglevel).toBe(LogLevels.ERROR);
    expect(parsedLog.transactionId).toBe(
      '9abc55b2-807b-4361-9dbe-aa88b1b2e978',
    );
    expect(parsedLog.timestamp).toBe(
      new Date(errorLog.split(delimiter)[0]).getTime(),
    );

    expect(observer.messages[0]).toBe(ObserverEvents.START);
    expect(observer.messages[2]).toBe(ObserverEvents.END);
  });

  it('should parse error log successfully', () => {
    // given

    // when
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const log: Log = reader.parse(Buffer.from(errorLog));

    // then
    expect(log.loglevel).toBe('error');
    expect(log.timestamp).toBe(new Date(errorLog.split(' - ')[0]).getTime());
    expect(log.transactionId).toBe('9abc55b2-807b-4361-9dbe-aa88b1b2e978');
    expect(log.err).toBe('Not found');
  });

  it('should throw error if log format is not proper', () => {
    // given
    const log1 = errorLog.split(delimiter);
    const log2 = errorLog.split(delimiter);
    const log3 = errorLog.split(delimiter);
    const log4 = [];

    // when
    log1[0] = 'test'; //date
    log2[1] = '';
    log3[2] = '{}';

    // then
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reader.validation(log1);
    }).toThrow(ParsingDateException);
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reader.validation(log2);
    }).toThrow(ParsingLogLevelException);
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reader.validation(log3);
    }).toThrow(ParsingTransactionDetailException);
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reader.validation(log4);
    }).toThrow(DelimiterException);
  });
});
