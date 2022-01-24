import Observer from '../models/observer';
import Subject from '../models/subject';

export class Reader implements Subject<string> {
  observers: Observer[] = [];

  publish(log: string): void {
    this.observers.forEach((observer) => {
      observer.consume(log);
    });
  }

  subscribe(observer: Observer): void {
    this.observers.push(observer);
  }

  unsubscribe(observer: Observer): void {
    this.observers = this.observers.filter((o) => {
      return o !== observer;
    });
  }
}
