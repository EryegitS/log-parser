import * as Joi from 'joi';

export class Config {
  private readonly transactionDetailValidationRules = Joi.object()
    .keys({
      transactionId: Joi.string().required(),
      err: Joi.string(),
      details: Joi.string(),
    })
    .unknown();

  private readonly logLevelValidationRule = Joi.string().required().not('');

  private readonly dateValidationRule = Joi.date().required();

  public validateLogLevel(value: any): any {
    const result = this.logLevelValidationRule.validate(value);
    if (result.error) throw new Error('Log level validation error!');
  }

  public validateDate(value: any): any {
    const result = this.dateValidationRule.validate(value);
    if (result.error) throw new Error('Date validation error!');
  }

  public validateTransactionDetail(value: any): any {
    const result = this.transactionDetailValidationRules.validate(value);
    if (result.error) throw new Error('Transaction detail validation error!');
  }
}
