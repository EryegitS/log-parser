import Observer from './observer';

export default interface Subject<T> {
  publish(data: T): void;
  subscribe(observer: Observer): void;
  unsubscribe(observer: Observer): void;
}
