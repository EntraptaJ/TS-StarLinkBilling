// src/Modules/StarLink/StarLinkAuthInput.ts
import { IsString } from 'class-validator';

export class StarLinkAuthInput {
  @IsString()
  public email: string;

  @IsString()
  public password: string;
}
