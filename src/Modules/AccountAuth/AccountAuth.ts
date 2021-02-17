// src/Modules/AccountAuth/AccountAuth.ts

import { IsEmail, IsString } from 'class-validator';
import { JSONSchema } from 'class-validator-jsonschema';

@JSONSchema({
  name: 'StarLinkAccountAuth',
})
export class AccountAuth {
  @IsEmail()
  @JSONSchema({
    type: 'string',
    description: 'StarLink Account Email',
  })
  public email: string;

  @IsString()
  @JSONSchema({
    type: 'string',
    description: 'StarLink Account Email',
  })
  public password: string;
}
