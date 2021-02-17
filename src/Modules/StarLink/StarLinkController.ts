// src/Modules/StarLink/StarLinkController.ts
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import got, { Got } from 'got';
import { parse } from 'node-html-parser';
import { CookieJar } from 'tough-cookie';
import { Service } from 'typedi';
import { promisify } from 'util';
import { Account } from '../Accounts/Account';
import { StarLinkAuthInput } from './StarLinkAuthInput';

@Service()
export class StarLinkController {
  private cookieJar = new CookieJar();

  private got: Got;

  public constructor() {
    this.got = got.extend({
      cookieJar: this.cookieJar,
    });
  }

  public async login(authInput: StarLinkAuthInput): Promise<void> {
    const input = plainToClass(StarLinkAuthInput, authInput);

    await validateOrReject(input);

    const loginRequest = await this.got(
      'https://api.starlink.com/auth/v1/sign-in',
      {
        method: 'POST',
        json: input,
        responseType: 'json',
        cookieJar: this.cookieJar,
      },
    );

    console.log(loginRequest.body);

    const request2 = await this.got(
      'https://api.starlink.com/auth-rp/auth/login?returnUrl=https%3A%2F%2Fwww.starlink.com%2Faccount',
      {
        method: 'GET',
        cookieJar: this.cookieJar,
      },
    );

    const parsedHTML = parse(request2.body);

    const inputNames = ['code', 'scope', 'state', 'session_state'];

    const formData = {};

    for (const inputName of inputNames) {
      const htmlInput = parsedHTML.querySelector(`input[name=${inputName}]`);

      console.log(`Setting ${inputName} to ${htmlInput.getAttribute('value')}`);
      formData[inputName] = htmlInput.getAttribute('value');
    }

    console.log('HelloWorld', formData);

    const callbackRequest = await this.got(
      'https://api.starlink.com/auth-rp/auth/callback',
      {
        method: 'POST',
        cookieJar: this.cookieJar,
        responseType: 'text',
        form: formData,
        throwHttpErrors: false,
      },
    );

    console.log('Sent my request', callbackRequest);
  }

  public async getNextPayment(): Promise<void> {
    console.log(this.cookieJar.toJSON());

    const nextPaymentRequest = await this.got(
      `https://api.starlink.com/webagg/v1/public/billing/next-payment`,
      {
        method: 'GET',
        resolveBodyOnly: true,
        responseType: 'json',
        cookieJar: this.cookieJar,
      },
    );

    console.log(nextPaymentRequest);
  }

  public async getAccounts(): Promise<Account> {
    const request = await this.got(
      `https://api.starlink.com/accounts/v1/accounts`,
      {
        method: 'GET',
        resolveBodyOnly: true,
        responseType: 'json',
        cookieJar: this.cookieJar,
      },
    );

    const value = plainToClass(Account, request?.content);

    await validateOrReject(value);

    return value;
  }

  public async getInvoices(accountId: string): Promise<Buffer[]> {
    const request = await this.got(
      `https://api.starlink.com/webagg/v1/public/invoice/account/${accountId}?limit=10&orderByDesc=true&includeCancelled=false&type=1`,
      {
        method: 'GET',
        resolveBodyOnly: true,
        responseType: 'json',
        cookieJar: this.cookieJar,
      },
    );

    return Promise.all(
      request.content.results.map((invoice) => {
        return this.got(
          `https://api.starlink.com/webagg/v1/public/invoice/${invoice.invoiceReferenceId}/download`,
          {
            method: 'GET',
            resolveBodyOnly: true,
            responseType: 'buffer',
            cookieJar: this.cookieJar,
          },
        );
      }),
    );
  }
}

export async function login(authInput: StarLinkAuthInput): Promise<void> {
  const input = plainToClass(StarLinkAuthInput, authInput);

  await validateOrReject(input);

  const cookieJar = new CookieJar();

  const setCookie = promisify(cookieJar.setCookie.bind(cookieJar));

  const loginRequest = await got('https://api.starlink.com/auth/v1/sign-in', {
    cookieJar,
    method: 'POST',
    json: input,
    responseType: 'json',
  });

  console.log(`loginRequest: `, loginRequest);

  console.log(cookieJar.toJSON());
}
