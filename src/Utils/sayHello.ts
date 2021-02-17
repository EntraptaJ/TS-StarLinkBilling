// src/Utils/sayHello.ts
import { logger } from '../Library/Logger';
import { timeout } from './timeout';

/**
 * Logs a greeting for the name after a 1.5 second delay.
 * @param name User you are greeting
 */
export async function sayHello<T extends string>(
  name: T = 'John' as T,
): Promise<`Hello ${T}!`> {
  logger.info('Waiting 1.5 seconds then saying Hi');

  await timeout(1500);

  const helloMessage = `Hello ${name}!` as const;

  logger.info(helloMessage);

  return helloMessage;
}
