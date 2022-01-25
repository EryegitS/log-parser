import { Config } from './config';
import { LogFileReader } from './readers/log-file-reader';
import { JsonExporter } from './exporters/json-exporter';
import { LogLevels } from './models/log';
import * as minimist from 'minimist';

/**
 * Application Context
 */
(function main() {
  // parsing command-line arguments
  const argv = minimist(process.argv.slice(2));

  // this class will read raw log data from filesystem.
  const logReader = new LogFileReader(new Config());

  // this class will write formatted log data to a json file.
  const jsonExporter = new JsonExporter(argv.output);

  // json exporter is subscribed to log reader via this function
  logReader.subscribe(jsonExporter);

  // reading logs process is started with this process
  logReader.read(argv.input, [LogLevels.ERROR]);
})();
