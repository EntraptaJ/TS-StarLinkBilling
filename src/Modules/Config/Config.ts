// src/Modules/Config/Config.ts

import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';
import { AccountAuth } from '../AccountAuth/AccountAuth';

@JSONSchema({
  description: 'StarLink Billing Configuration',
})
export class Config {
  @ValidateNested({
    each: true,
  })
  @Type(() => AccountAuth)
  public accounts: AccountAuth[];
}
