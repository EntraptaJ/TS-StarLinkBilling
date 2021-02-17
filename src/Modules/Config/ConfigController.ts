// src/Modules/Config/ConfigController.ts
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { defaultMetadataStorage } from 'class-transformer/storage';
import { Service } from 'typedi';
import winston from 'winston';
import { logger } from '../../Library/Logger';
import Ajv from 'ajv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile } from 'fs/promises';
import { load } from 'js-yaml';
import { Config } from './Config';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';

@Service()
export class ConfigController {
  public logger: winston.Logger;

  public constructor() {
    this.logger = logger.child({
      className: 'ConfigController',
    });
  }

  public async createSchema(): Promise<Ajv.ValidateFunction> {
    this.logger.debug(`Creating JSON Schema.`);

    this.logger.debug(`Dynamically importing ./ConfigSchema`);

    await Promise.all([import('./Config')]);

    const { Config, ...schemas } = validationMetadatasToSchemas({
      classTransformerMetadataStorage: defaultMetadataStorage,
    });

    const coreSchema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      definitions: schemas,
      $id: 'Config',
      ...Config,
    };

    const ajv = new Ajv();

    return ajv.compile(coreSchema);
  }

  /**
   * Load JSON Schema and save `IPAM.json` to Schemas folder.
   *
   * @returns Promise that resolves once the file has been saved.
   */
  public async saveSchema(): Promise<void> {
    const schema = await this.createSchema();

    const schemaFilePath = resolve(
      fileURLToPath(import.meta.url),
      '../../../../schemas/Config.json',
    );

    return writeFile(schemaFilePath, JSON.stringify(schema.schema));
  }

  public async loadConfig(configPath?: string): Promise<Config> {
    const filePath = configPath ?? 'Config.yaml';

    const validateSchema = await this.createSchema();

    const configFile = await readFile(filePath);
    const configString = configFile.toString();

    const configYAML = load(configString);

    const errors: Set<string> = new Set();

    if (validateSchema(configYAML)) {
      const transformed = plainToClass(Config, configYAML, {
        strategy: 'exposeAll',
      });

      this.logger.debug(`transformedClass: `, transformed);

      await validateOrReject(transformed);

      return transformed;
    }
  }
}
