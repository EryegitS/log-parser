import Observer from '../models/observer';

export class Consumer implements Observer {
  messages: string[] = [];

  public consume(message: string) {
    this.messages.push(message);
  }
}
