// src/Modules/Accounts/Account.ts
import { IsString } from 'class-validator';

export class Account {
  @IsString()
  public accountNumber: string;

  @IsString()
  public accountName: string;
}
