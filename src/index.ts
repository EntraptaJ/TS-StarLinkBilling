// src/index.ts
import './Utils/setup';
import { logger } from './Library/Logger';
import { StarLinkController } from './Modules/StarLink/StarLinkController';
import Container from 'typedi';
import { ConfigController } from './Modules/Config/ConfigController';

const configController = Container.get(ConfigController);

await configController.saveSchema();

const config = await configController.loadConfig('Config.yml');

for (const account of config.accounts) {
  logger.debug(`Account`, {
    account,
  });

  const container = Container.of(account.email);

  const starLinkController = container.get(StarLinkController);

  await starLinkController.login(account);

  const { accountNumber } = await starLinkController.getAccounts();

  const invoices = await starLinkController.getInvoices(accountNumber);

  for (const invoice of invoices) {
    console.log(invoice);
  }
}

export {};
