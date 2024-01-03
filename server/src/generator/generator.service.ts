import { Injectable } from '@nestjs/common';
import * as path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import * as ejs from 'ejs';
import * as fs from 'fs-extra';

import { AuthData, GenerateOptions } from './types/generate-options';
import {
  generateCorsConfigOptions,
  generatePostgresConfigOptions,
  generateSwaggerConfigOptions,
} from './constants';
import { areKeysComplete, mapOptionsToArrayOfData } from './generator.helpers';

const execPromise = promisify(exec);

@Injectable()
export class GeneratorService {
  private templatesFolder = path.join(
    process.cwd(),
    'src',
    'generator',
    'templates',
  );

  private generateDefaultProject = async (
    generatedProjectFolder: string,
    projectName: string,
  ) => {
    await fs.remove(generatedProjectFolder);

    await execPromise(
      `nest new -s -p npm --directory ${generatedProjectFolder} ${projectName}`,
    );
  };

  private copyFilesToSrc = async (
    options: GenerateOptions,
    generatedProjectFolder: string,
  ) => {
    const optionsToFiles = {
      allExceptions: [
        'common/filters/all-exceptions.filter.ts',
        'common/types/app-request.ts',
      ],
      authJwt: [
        'auth/dtos/',
        'auth/guards/jwt-auth.guard.ts',
        'auth/strategies/jwt.strategy.ts',
        'auth/constants.ts',
        'auth/auth.service.ts',
        'users/',
        'database/',
        'common/providers/database.providers.ts',
      ],
      authGoogle: [
        'auth/guards/google-auth.guard.ts',
        'auth/strategies/google.strategy.ts',
      ],
      authFacebook: [
        'auth/guards/facebook-auth.guard.ts',
        'auth/strategies/facebook.strategy.ts',
      ],
      authOpenid: [
        'auth/guards/openid-auth.guard.ts',
        'auth/strategies/openid.strategy.ts',
      ],
      postgres: ['docker-compose.yml'],
    };

    return Promise.all(
      mapOptionsToArrayOfData(options, optionsToFiles).map((file) =>
        fs.copy(
          path.join(this.templatesFolder, file),
          path.join(process.cwd(), generatedProjectFolder, 'src', file),
        ),
      ),
    );
  };

  private generateFile = async (
    templateFileName: string,
    data: Record<string, any>,
    resultFileName: string,
  ) => {
    const template = await readFile(templateFileName, { encoding: 'utf8' });
    const content = await ejs.render(template, data, {
      async: true,
    });

    console.log({ template, content });

    return writeFile(resultFileName, content);
  };

  private addModulesInPackageJson = async (
    options: GenerateOptions,
    generatedProjectFolder: string,
  ) => {
    const optionsToModules = {
      swagger: ['@nestjs/swagger'],
      helmet: ['helmet'],
      postgres: ['@nestjs/typeorm', 'typeorm', 'pg', 'dotenv'],
      authJwt: [
        'cookie-parser',
        '@nestjs/passport',
        '@nestjs/mongoose',
        '@nestjs/jwt',
        'mongoose',
        'passport-jwt',
        'bcrypt',
        'class-transformer',
        'class-validator',
      ],
      authGoogle: ['passport-google-oauth20'],
      authFacebook: ['passport-facebook'],
      authOpenid: ['openid-client'],
    };

    const packages = [
      'express-session',
      ...mapOptionsToArrayOfData(options, optionsToModules),
    ];

    try {
      await execPromise(
        `cd ${generatedProjectFolder} && npm install --save ${packages.join(
          ' ',
        )}`,
      );
    } catch (e) {
      console.log(e);
    }
  };

  // user of the generated project should run npm install
  private deleteNodeModules = async (generatedProjectFolder: string) => {
    await fs.remove(path.join(generatedProjectFolder, 'node_modules'));
  };

  private generateMainTs = async (
    options: GenerateOptions,
    generatedProjectFolder: string,
  ) => {
    const optionsToImports = {
      allExceptions: [
        `import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';`,
      ],
      swagger: [
        `import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';`,
      ],
      helmet: [`import helmet from 'helmet';`],
    };

    const optionsToGlobalFilters = {
      allExceptions: ['app.useGlobalFilters(new AllExceptionsFilter());'],
    };

    const optionsToGlobalPipes = {
      validation: ['app.useGlobalPipes(new ValidationPipe());'],
    };

    const optionsAppConfig = {
      cors: [generateCorsConfigOptions()],
      swagger: [await generateSwaggerConfigOptions()],
      helmet: ['app.use(helmet());'],
    };

    const optionsToNestFactoryOptions = {
      logger: [
        {
          key: 'logger',
          value: `['debug', 'verbose', 'log', 'warn', 'error']`,
        },
      ],
    };

    const optionsToNestjsCommonImport = {
      validation: ['', 'ValidationPipe'],
    };

    const data = {
      nestjsCommonImport: mapOptionsToArrayOfData(
        options,
        optionsToNestjsCommonImport,
      ).join(', '),
      imports: mapOptionsToArrayOfData(options, optionsToImports),
      nestFactoryOptions: mapOptionsToArrayOfData(
        options,
        optionsToNestFactoryOptions,
      ),
      globalPipes: mapOptionsToArrayOfData(options, optionsToGlobalPipes),
      globalFilters: mapOptionsToArrayOfData(options, optionsToGlobalFilters),
      globalOptionsConfig: mapOptionsToArrayOfData(options, optionsAppConfig),
      ...options,
    };

    return this.generateFile(
      path.join(this.templatesFolder, 'main.ts.ejs'),
      data,
      path.join(process.cwd(), generatedProjectFolder, 'src', 'main.ts'),
    );
  };

  private generateAppModule = async (
    options: GenerateOptions,
    generatedProjectFolder: string,
  ) => {
    const optionsToImports = {
      postgres: [
        `import { TypeOrmModule } from '@nestjs/typeorm';`,
        `import 'dotenv/config';`,
      ],
    };
    const optionsToModuleImports = {
      postgres: [generatePostgresConfigOptions()],
    };
    const data = {
      imports: mapOptionsToArrayOfData(options, optionsToImports),
      moduleImports: mapOptionsToArrayOfData(options, optionsToModuleImports),
      ...options,
    };
    return this.generateFile(
      path.join(this.templatesFolder, 'app.module.ts.ejs'),
      data,
      path.join(process.cwd(), generatedProjectFolder, 'src', 'app.module.ts'),
    );
  };

  private formatWithPrettier = async (generatedProjectFolder: string) => {
    await execPromise(`cd ${generatedProjectFolder} && npm run format`);
  };

  private generateAuthModule = async (
    options: GenerateOptions,
    generatedProjectFolder: string,
  ) => {
    if (!options.authJwt) {
      return;
    }

    await Promise.all([
      this.generateFile(
        path.join(this.templatesFolder, 'auth', 'auth.module.ts.ejs'),
        options,
        path.join(
          process.cwd(),
          generatedProjectFolder,
          'src',
          'auth',
          'auth.module.ts',
        ),
      ),
      this.generateFile(
        path.join(this.templatesFolder, 'auth', 'auth.controller.ts.ejs'),
        options,
        path.join(
          process.cwd(),
          generatedProjectFolder,
          'src',
          'auth',
          'auth.controller.ts',
        ),
      ),
    ]);
  };

  private generateEnvFile = async (
    options: GenerateOptions,
    generatedProjectFolder: string,
  ): Promise<void> => {
    const {
      authJwt,
      postgres,
      authFacebook,
      authGoogle,
      authOpenid,
      strategies,
    } = options;

    if (!(authJwt || postgres || authFacebook || authGoogle || authOpenid)) {
      return;
    }

    const optionsToEnv: Record<string, string[]> = {};

    Object.keys(strategies).forEach((strategyKey) => {
      const strategy = strategies[strategyKey as keyof AuthData];
      if (areKeysComplete(strategy) && strategy) {
        const prefix =
          strategyKey === 'authOpenid'
            ? 'NEST_PUBLIC_'
            : `NEST_PUBLIC_${strategyKey.toUpperCase()}_`;
        const suffix = strategyKey === 'authOpenid' ? '' : '_CLIENT_SECRET';

        optionsToEnv[strategyKey] = [
          `
    ${prefix}${strategyKey.toUpperCase()}_CLIENT_ID=${strategy.clientID}
    ${strategyKey.toUpperCase()}${suffix}=${strategy.clientSecret}
    ${prefix}${strategyKey.toUpperCase()}_CALLBACK_URL=${strategy.callbackURL}
    ${
      strategyKey === 'authOpenid'
        ? `TRUST_ISSUER_URL=${strategy.trustIssuer || ''}`
        : ''
    }
    `,
        ];
      }
    });

    const {
      authFacebook: fb,
      authGoogle: google,
      authOpenid: openid,
    } = optionsToEnv;
    const data = { authFacebook: fb, authGoogle: google, authOpenid: openid };

    return this.generateFile(
      path.join(this.templatesFolder, '.env.example.ts.ejs'),
      data,
      path.join(process.cwd(), generatedProjectFolder, '.', '.env'),
    );
  };

  generate = async (options: GenerateOptions) => {
    const normalizedOptions = {
      ...options,
      authJwt:
        options.authJwt ||
        options.authGoogle ||
        options.authFacebook ||
        options.authOpenid,
    };

    const generatedProjectFolder = path.join(
      'generated-projects',
      normalizedOptions.projectName,
    );

    await this.generateDefaultProject(
      generatedProjectFolder,
      normalizedOptions.projectName,
    );

    await Promise.all([
      this.copyFilesToSrc(normalizedOptions, generatedProjectFolder),
      this.generateMainTs(normalizedOptions, generatedProjectFolder),
      this.generateAppModule(normalizedOptions, generatedProjectFolder),
      this.generateAuthModule(normalizedOptions, generatedProjectFolder),

      this.addModulesInPackageJson(normalizedOptions, generatedProjectFolder),
      this.formatWithPrettier(generatedProjectFolder),
      this.generateEnvFile(normalizedOptions, generatedProjectFolder),
    ]);

    await this.deleteNodeModules(generatedProjectFolder);

    return;
  };
}
