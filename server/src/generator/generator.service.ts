import { Injectable } from '@nestjs/common';
import * as path from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import * as ejs from 'ejs';
import * as fs from 'fs-extra';

import { GenerateOptions } from './types/generate-options';
import {
  generateCorsConfigOptions,
  generatePostgresConfigOptions,
  generateSwaggerConfigOptions,
} from './constants';

const execPromise = promisify(exec);

@Injectable()
export class GeneratorService {
  private templatesFolder = path.join(
    process.cwd(),
    'src',
    'generator',
    'templates',
  );

  private mapOptionsToArrayOfData = <T>(
    options: GenerateOptions,
    optionsTo: Record<string, T[]>,
  ) => {
    return Object.keys(options).reduce((acc, key) => {
      if (optionsTo[key] && options[key]) {
        return [...acc, ...optionsTo[key]];
      }

      return acc;
    }, []);
  };

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
      postgres: ['docker-compose.yml', '.env.example'],
    };

    return Promise.all(
      this.mapOptionsToArrayOfData(options, optionsToFiles).map((file) =>
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
      ...this.mapOptionsToArrayOfData(options, optionsToModules),
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
      nestjsCommonImport: this.mapOptionsToArrayOfData(
        options,
        optionsToNestjsCommonImport,
      ).join(', '),
      imports: this.mapOptionsToArrayOfData(options, optionsToImports),
      nestFactoryOptions: this.mapOptionsToArrayOfData(
        options,
        optionsToNestFactoryOptions,
      ),
      globalPipes: this.mapOptionsToArrayOfData(options, optionsToGlobalPipes),
      globalFilters: this.mapOptionsToArrayOfData(
        options,
        optionsToGlobalFilters,
      ),
      globalOptionsConfig: this.mapOptionsToArrayOfData(
        options,
        optionsAppConfig,
      ),
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
      imports: this.mapOptionsToArrayOfData(options, optionsToImports),
      moduleImports: this.mapOptionsToArrayOfData(
        options,
        optionsToModuleImports,
      ),
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
    ]);

    await this.deleteNodeModules(generatedProjectFolder);

    return;
  };
}
