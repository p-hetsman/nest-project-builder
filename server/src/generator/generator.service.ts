import { Injectable } from '@nestjs/common';
import * as path from 'node:path';

import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import * as fs from 'fs-extra';

import { GenerateOptions } from './types/generate-options';

import {
  addModulesInPackageJson,
  copyFilesToRoot,
  copyFilesToSrc,
  formatWithPrettier,
  generateAppModule,
  generateAuthModule,
  generateEnvFile,
  generateMainTs,
} from './generator.helpers';

const execPromise = promisify(exec);

@Injectable()
export class GeneratorService {
  private generateDefaultProject = async (
    generatedProjectFolder: string,
    projectName: string,
  ) => {
    await fs.remove(generatedProjectFolder);

    await execPromise(
      `nest new -s -p npm --directory ${generatedProjectFolder} ${projectName}`,
    );
  };

  // user of the generated project should run npm install
  private deleteNodeModules = async (generatedProjectFolder: string) => {
    await fs.remove(path.join(generatedProjectFolder, 'node_modules'));
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
      copyFilesToSrc(normalizedOptions, generatedProjectFolder),
      copyFilesToRoot(generatedProjectFolder),
      generateMainTs(normalizedOptions, generatedProjectFolder),
      generateAppModule(normalizedOptions, generatedProjectFolder),
      generateAuthModule(normalizedOptions, generatedProjectFolder),
      addModulesInPackageJson(normalizedOptions, generatedProjectFolder),
      generateEnvFile(normalizedOptions, generatedProjectFolder),
      formatWithPrettier(generatedProjectFolder),
    ]);

    await this.deleteNodeModules(generatedProjectFolder);

    return;
  };
}
