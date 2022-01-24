import * as fs from 'fs';
import { WriteStream } from 'fs';
import { ObserverEvents } from '../models/observer-events';
import { Consumer } from './consumer';

export class JsonExporter extends Consumer {
  writeStream: WriteStream;
  firstElementInserted: boolean;

  constructor(path = 'output.json') {
    super();
    this.writeStream = fs.createWriteStream(path);
  }

  public consume(message: string) {
    if (message === ObserverEvents.START) {
      this.firstElementInserted = false;
      this.writeStream.write('[');
    } else if (message === ObserverEvents.END) {
      this.writeStream.write(']');
      this.firstElementInserted = false;
    } else {
      if (this.firstElementInserted) {
        message = ',' + message;
      } else {
        this.firstElementInserted = true;
      }
      this.writeStream.write(message);
    }
  }
}
