import { Config } from './config';
import { LogFileReader } from './readers/log-file-reader';
import { JsonExporter } from './consumers/json-exporter';
import { LogLevels } from './models/log';
import * as minimist from 'minimist';

/**
 * Application Context
 */
(function main() {
  const argv = minimist(process.argv.slice(2));
  const config = new Config();
  const jsonExporter = new JsonExporter(argv.output);
  const logReader = new LogFileReader(config, ' - ');
  logReader.subscribe(jsonExporter);
  logReader.read(argv.input, [LogLevels.ERROR]);
})();
