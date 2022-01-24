export class ParsingLogLevelException extends Error {
  private readonly code = 3;
  private payload: Record<any, any>;

  constructor(value, payload) {
    super(`Check log level: ${value}`);
    this.payload = payload;
  }
}
