export class DelimiterException extends Error {
  private readonly code = 1;

  constructor(value) {
    super(
      `Parsing Error.Please check the delimiter. Parsed value by delimiter:  ${value}`,
    );
  }
}
