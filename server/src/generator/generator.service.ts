import { Injectable } from '@nestjs/common';
import * as path from 'node:path';
import { readFile, writeFile, cp } from 'node:fs/promises';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import * as ejs from 'ejs';
import { rimraf } from 'rimraf';

import { GenerateOptions } from './types/generate-options';

const execPromise = promisify(exec);

@Injectable()
export class GeneratorService {
  private mapOptionsToArrayOfData = <T>(
    options: GenerateOptions,
    optionsTo: Record<string, T[]>,
  ) => {
    return Object.keys(options).reduce((acc, key) => {
      if (optionsTo[key]) {
        return [...acc, ...optionsTo[key]];
      }

      return acc;
    }, []);
  };

  private generateDefaultProject = async (
    generatedProjectFolder: string,
    projectName: string,
  ) => {
    await rimraf(generatedProjectFolder);

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
    };

    return Promise.all(
      this.mapOptionsToArrayOfData(options, optionsToFiles).map((file) =>
        cp(
          path.join(__dirname, 'templates', file),
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
    const content = await ejs.render(template, data, { async: true });

    console.log({ template, content });

    return writeFile(resultFileName, content);
  };

  private addModulesInPackageJson = async (
    options: GenerateOptions,
    generatedProjectFolder: string,
  ) => {
    const optionsToModules = {};

    try {
      await execPromise(
        `cd ${generatedProjectFolder} && npm install --save ${this.mapOptionsToArrayOfData(
          options,
          optionsToModules,
        ).join(' ')}`,
      );
    } catch (e) {
      console.log(e);
    }
  };

  private generateMainTs = async (
    options: GenerateOptions,
    generatedProjectFolder: string,
  ) => {
    const optionsToImports = {
      allExceptions: [
        `import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';`,
      ],
    };

    const optionsToGlobalFilters = {
      allExceptions: ['app.useGlobalFilters(new AllExceptionsFilter());'],
    };

    const optionsToGlobalPipes = {
      validation: ['app.useGlobalPipes(new ValidationPipe());'],
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
    };

    return this.generateFile(
      path.join(__dirname, 'templates', 'main.ts.ejs'),
      data,
      path.join(process.cwd(), generatedProjectFolder, 'src', 'main.ts'),
    );
  };

  private generateAppModule = async (generatedProjectFolder: string) => {
    return this.generateFile(
      path.join(__dirname, 'templates', 'app.module.ts.ejs'),
      {},
      path.join(process.cwd(), generatedProjectFolder, 'src', 'app.module.ts'),
    );
  };

  generate = async (options: GenerateOptions) => {
    const generatedProjectFolder = path.join(
      'generated-projects',
      options.projectName,
    );

    await this.generateDefaultProject(
      generatedProjectFolder,
      options.projectName,
    );

    await Promise.all([
      await this.copyFilesToSrc(options, generatedProjectFolder),
      await this.generateMainTs(options, generatedProjectFolder),
      await this.addModulesInPackageJson(options, generatedProjectFolder),
    ]);

    // await this.generateAppModule(generatedProjectFolder);

    return;
  };
}
