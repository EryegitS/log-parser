export class ParsingDateException extends Error {
  private readonly code = 2;
  private payload: Record<any, any>;

  constructor(value, payload) {
    super(`The value is not parseable as Date object. value: ${value}`);
    this.payload = payload;
  }
}
