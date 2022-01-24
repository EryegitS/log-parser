export default interface Observer {
  consume(message: any): void;
}
