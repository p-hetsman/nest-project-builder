import { Injectable } from '@nestjs/common';
import * as path from 'node:path';

import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import * as fs from 'fs-extra';

import { GenerateOptions } from './types/generate-options';

import {
  allExceptionsCopyFiles,
  authFacebookCopyFiles,
  authGoogleCopyFiles,
  authJwtCopyFiles,
  authOpenidCopyFiles,
  generateCorsConfigOptions,
  generatePostgresConfigOptions,
  generateSwaggerConfigOptions,
} from './constants';
import {
  addModulesInPackageJson,
  formatWithPrettier,
  generateAuthModule,
  generateEnvFile,
  generateFile,
  mapOptionsToArrayOfData,
} from './generator.helpers';

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
      allExceptions: allExceptionsCopyFiles,
      authJwt: authJwtCopyFiles,
      authGoogle: authGoogleCopyFiles,
      authFacebook: authFacebookCopyFiles,
      authOpenid: authOpenidCopyFiles,
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

  private copyFilesToRoot = async (generatedProjectFolder: string) => {
    const files = ['Dockerfile'];

    return Promise.all(
      files.map((file) =>
        fs.copy(
          path.join(this.templatesFolder, file),
          path.join(process.cwd(), generatedProjectFolder, file),
        ),
      ),
    );
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

    return generateFile(
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
      authJwt: [
        `import { TestController } from './test-route/test.controller';`,
      ],
    };
    const optionsToModuleImports = {
      postgres: [generatePostgresConfigOptions()],
    };
    const optionsToControllersImports = {
      authJwt: ['TestController'],
    };
    const data = {
      imports: mapOptionsToArrayOfData(options, optionsToImports),
      moduleImports: mapOptionsToArrayOfData(options, optionsToModuleImports),
      controllersImports: mapOptionsToArrayOfData(
        options,
        optionsToControllersImports,
      ),
      ...options,
    };

    return generateFile(
      path.join(this.templatesFolder, 'app.module.ts.ejs'),
      data,
      path.join(process.cwd(), generatedProjectFolder, 'src', 'app.module.ts'),
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
      this.copyFilesToRoot(generatedProjectFolder),

      this.generateMainTs(normalizedOptions, generatedProjectFolder),
      this.generateAppModule(normalizedOptions, generatedProjectFolder),

      generateAuthModule(
        normalizedOptions,
        generatedProjectFolder,
        this.templatesFolder,
      ),
      addModulesInPackageJson(normalizedOptions, generatedProjectFolder),
      generateEnvFile(
        normalizedOptions,
        generatedProjectFolder,
        this.templatesFolder,
      ),
      formatWithPrettier(generatedProjectFolder),
    ]);

    await this.deleteNodeModules(generatedProjectFolder);

    return;
  };
}
