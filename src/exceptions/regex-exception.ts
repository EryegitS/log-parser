export class RegexException extends Error {
  private readonly code = 1;
  private readonly payload: string = '';

  constructor(message, payload) {
    super(`Regex parsing Error.Please check the line:  ${message}`);
    this.payload = payload;
  }
}
