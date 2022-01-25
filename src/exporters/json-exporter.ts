import * as fs from 'fs';
import { WriteStream } from 'fs';
import { ObserverEvents } from '../models/observer-events';
import { Exporter } from './exporter';

export class JsonExporter extends Exporter {
  private writeStream: WriteStream;
  firstElementInserted: boolean;
  path: string

  constructor(path = 'output.json') {
    super();
    this.path = path;
  }

  public consume(message: string) {
    switch (message) {
      case ObserverEvents.START:
        this.firstElementInserted = false;
        this.writeStream = fs.createWriteStream(this.path);
        this.addOpeningElement();
        break;
      case ObserverEvents.END:
        this.writeStream.destroy();
        this.addClosureElement();
        break;
      case ObserverEvents.ERROR:
        // Not Implemented but we can close(destroy) the stream and delete file
        break;
      default:
        this.write(message);
    }
  }

  private addOpeningElement(): void {
    this.writeStream.write('[');
  }

  private addClosureElement(): void {
    this.writeStream.write(']');
    this.firstElementInserted = false;
  }

  private write(message: string): void {
    if (this.firstElementInserted) {
      message = ',' + message;
    } else {
      this.firstElementInserted = true;
    }
    this.writeStream.write(message);
  }
}
