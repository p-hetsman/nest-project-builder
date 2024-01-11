import * as path from 'node:path';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

import * as ejs from 'ejs';
import * as fs from 'fs-extra';

import {
  AuthData,
  AuthStrategy,
  GenerateOptions,
} from './types/generate-options';
import {
  allExceptionsCopyFiles,
  authFacebookCopyFiles,
  authGoogleCopyFiles,
  authJwtCopyFiles,
  authOpenidCopyFiles,
  generateCorsConfigOptions,
  generatePostgresConfigOptions,
  generateSwaggerConfigOptions,
  mongoDBCopyFiles,
  packageJsonAuthJwt,
} from './constants';

const execPromise = promisify(exec);
const templatesFolder = path.join(
  process.cwd(),
  'src',
  'generator',
  'templates',
);

/**
 * Retrieves data from a project file.
 *
 * @param {string} path - The path to the file.
 * @return {Promise<any>} The data from the file.
 */
export async function getProjectFileData(path: string) {
  try {
    const fileContent = await readFile(path, 'utf8');
    const fileData = JSON.parse(fileContent);
    return fileData;
  } catch (error) {
    console.error(`Error reading file ${path}:`, error);
    return null;
  }
}

/**
 * Maps the options object to an array of data based on the provided optionsTo object.
 *
 * @param {GenerateOptions} options - The options object.
 * @param {Record<string, T[]>} optionsTo - The optionsTo object.
 * @return {T[]} An array of data based on the mapping of options to optionsTo.
 */
export const mapOptionsToArrayOfData = <T>(
  options: GenerateOptions,
  optionsTo: Record<string, T[]>,
) => {
  const result: T[] = [];

  for (const key of Object.keys(options)) {
    if (optionsTo[key] && options[key]) {
      result.push(...optionsTo[key]);
    }
  }

  return result;
};
/**
 * Determines if the keys required for authentication strategy are complete.
 *
 * @param {AuthStrategy} strategy - The authentication strategy object.
 * @return {boolean} Returns true if the keys are complete, false otherwise.
 */
export function areKeysComplete(strategy: AuthStrategy): boolean {
  const { clientID, clientSecret, callbackURL } = strategy;
  return !!clientID && !!clientSecret && !!callbackURL;
}

/**
 * Generates a file by rendering a template with the provided data and saves it to the specified location.
 *
 * @param {string} templateFileName - The path to the template file.
 * @param {Record<string, any>} data - The data to be used for rendering the template.
 * @param {string} resultFileName - The path where the rendered content will be saved.
 * @return {Promise<void>} A promise that resolves when the file is successfully generated and saved.
 */
export const generateFile = async (
  templateFileName: string,
  data: Record<string, any>,
  resultFileName: string,
) => {
  const templateContent = await readFile(templateFileName, {
    encoding: 'utf8',
  });
  const renderedContent = await ejs.render(templateContent, data, {
    async: true,
  });

  console.log({ templateContent, renderedContent });

  return writeFile(resultFileName, renderedContent);
};

/**
 * Generates an environment file for a project based on the given options.
 *
 * @param {GenerateOptions} options - The options for generating the environment file.
 * @param {string} generatedProjectFolder - The folder path where the project is generated.
 * @param {string} templatesFolder - The folder path where the templates are located.
 * @return {Promise<void>} A promise that resolves when the environment file is generated.
 */
export const generateEnvFile = async (
  options: GenerateOptions,
  generatedProjectFolder: string,
): Promise<void> => {
  const { authJwt, strategies } = options;

  if (!authJwt) {
    return;
  }

  const optionsToEnv: Record<string, string[]> = {};
  const authLength = 'auth'.length;

  for (const strategyKey of Object.keys(strategies)) {
    const strategy = strategies[strategyKey as keyof AuthData];

    if (areKeysComplete(strategy) && strategy) {
      const prefix = 'NEST_PUBLIC_';
      const suffix = '_CLIENT_SECRET';

      optionsToEnv[strategyKey] = [
        `${prefix}${strategyKey.slice(authLength).toUpperCase()}_CLIENT_ID=${
          strategy.clientID
        }`,
        `${strategyKey.slice(authLength).toUpperCase()}${suffix}=${
          strategy.clientSecret
        }`,
        `${prefix}${strategyKey.slice(authLength).toUpperCase()}_CALLBACK_URL=${
          strategy.callbackURL
        }`,
        `${
          strategyKey === 'authOpenid'
            ? `TRUST_ISSUER_URL=${strategy.trustIssuer || ''}`
            : ''
        }`,
      ];
    }
  }

  const {
    authFacebook: fb,
    authGoogle: google,
    authOpenid: openid,
  } = optionsToEnv;
  const data = { authFacebook: fb, authGoogle: google, authOpenid: openid };

  return generateFile(
    path.join(templatesFolder, '.env.example.ejs'),
    data,
    path.join(process.cwd(), generatedProjectFolder, '.', '.env'),
  );
};

/**
 * Formats the project located at the specified folder using Prettier.
 *
 * @param {string} generatedProjectFolder - The path to the generated project folder.
 * @return {Promise<void>} A Promise that resolves when the formatting is complete.
 */
export const formatWithPrettier = async (generatedProjectFolder: string) => {
  const command = `cd ${generatedProjectFolder} && npm run format`;
  await execPromise(command);
};

/**
 * Adds modules to the package.json file based on the given options.
 *
 * @param {GenerateOptions} options - The options for generating the modules.
 * @param {string} generatedProjectFolder - The path to the generated project folder.
 * @return {Promise<void>} - A promise that resolves when the modules are added.
 */
export const addModulesInPackageJson = async (
  options: GenerateOptions,
  generatedProjectFolder: string,
) => {
  const optionsToModules = {
    swagger: ['@nestjs/swagger'],
    helmet: ['helmet'],
    postgres: ['@nestjs/typeorm', 'typeorm', 'pg', 'dotenv'],
    authJwt: packageJsonAuthJwt,
    authGoogle: ['passport-google-oauth20'],
    authFacebook: ['passport-facebook'],
    authOpenid: ['openid-client'],
  };

  const packages = [
    'express-session',
    ...mapOptionsToArrayOfData(options, optionsToModules),
  ];

  try {
    const installCommand = `cd ${generatedProjectFolder} && npm install --save ${packages.join(
      ' ',
    )}`;
    await execPromise(installCommand);
  } catch (error) {
    console.log(error);
  }
};
/**
 * Generates an authentication module based on the provided options.
 *
 * @param {GenerateOptions} options - The options for generating the authentication module.
 * @param {string} generatedProjectFolder - The path to the generated project folder.
 * @param {string} templatesFolder - The path to the templates folder.
 * @return {Promise<void>} - A promise that resolves when the authentication module is generated.
 */
export const generateAuthModule = async (
  options: GenerateOptions,
  generatedProjectFolder: string,
) => {
  if (!options.authJwt) {
    return;
  }

  const moduleTemplatePath = path.join(
    templatesFolder,
    'auth',
    'auth.module.ts.ejs',
  );
  const moduleOutputPath = path.join(
    process.cwd(),
    generatedProjectFolder,
    'src',
    'auth',
    'auth.module.ts',
  );
  const controllerTemplatePath = path.join(
    templatesFolder,
    'auth',
    'auth.controller.ts.ejs',
  );
  const controllerOutputPath = path.join(
    process.cwd(),
    generatedProjectFolder,
    'src',
    'auth',
    'auth.controller.ts',
  );

  await Promise.all([
    generateFile(moduleTemplatePath, options, moduleOutputPath),
    generateFile(controllerTemplatePath, options, controllerOutputPath),
  ]);
};
/**
 * Generates the app module for the given options and project folder.
 *
 * @param {GenerateOptions} options - The options for generating the app module.
 * @param {string} generatedProjectFolder - The folder where the generated project will be placed.
 * @return {Promise<void>} - A promise that resolves once the app module is generated.
 */
export const generateAppModule = async (
  options: GenerateOptions,
  generatedProjectFolder: string,
) => {
  const imports = {
    postgres: [
      `import { TypeOrmModule } from '@nestjs/typeorm';`,
      `import 'dotenv/config';`,
    ],
    authJwt: [`import { TestController } from './test-route/test.controller';`],
  };
  const moduleImports = {
    postgres: [generatePostgresConfigOptions()],
  };
  const controllersImports = {
    authJwt: ['TestController'],
  };
  const data = {
    imports: mapOptionsToArrayOfData(options, imports),
    moduleImports: mapOptionsToArrayOfData(options, moduleImports),
    controllersImports: mapOptionsToArrayOfData(options, controllersImports),
    ...options,
  };

  return generateFile(
    path.join(templatesFolder, 'app.module.ts.ejs'),
    data,
    path.join(process.cwd(), generatedProjectFolder, 'src', 'app.module.ts'),
  );
};
/**
 * Generates the main.ts file for the project.
 *
 * @param {GenerateOptions} options - The options for generating the main.ts file.
 * @param {string} generatedProjectFolder - The path of the generated project folder.
 * @return {Promise<void>} - A promise that resolves when the main.ts file is generated.
 */
export const generateMainTs = async (
  options: GenerateOptions,
  generatedProjectFolder: string,
) => {
  const imports = {
    allExceptions: [
      `import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';`,
    ],
    swagger: [
      `import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';`,
    ],
    helmet: [`import helmet from 'helmet';`],
  };

  const globalFilters = {
    allExceptions: ['app.useGlobalFilters(new AllExceptionsFilter());'],
  };

  const globalPipes = {
    validation: ['app.useGlobalPipes(new ValidationPipe());'],
  };

  const appConfig = {
    cors: [generateCorsConfigOptions()],
    swagger: [await generateSwaggerConfigOptions()],
    helmet: ['app.use(helmet());'],
  };

  const nestFactoryOptions = {
    logger: [
      {
        key: 'logger',
        value: `['debug', 'verbose', 'log', 'warn', 'error']`,
      },
    ],
  };

  const nestjsCommonImport = {
    validation: ['', 'ValidationPipe'],
  };

  const data = {
    nestjsCommonImport: mapOptionsToArrayOfData(
      options,
      nestjsCommonImport,
    ).join(', '),
    imports: mapOptionsToArrayOfData(options, imports),
    nestFactoryOptions: mapOptionsToArrayOfData(options, nestFactoryOptions),
    globalPipes: mapOptionsToArrayOfData(options, globalPipes),
    globalFilters: mapOptionsToArrayOfData(options, globalFilters),
    globalOptionsConfig: mapOptionsToArrayOfData(options, appConfig),
    ...options,
  };

  return generateFile(
    path.join(templatesFolder, 'main.ts.ejs'),
    data,
    path.join(process.cwd(), generatedProjectFolder, 'src', 'main.ts'),
  );
};

/**
 * Copies specified files to the root of the generated project folder.
 *
 * @param {string} generatedProjectFolder - The path of the generated project folder.
 * @return {Promise<void[]>} A promise that resolves when all the files are copied.
 */
export const copyFilesToRoot = async (generatedProjectFolder: string) => {
  const filesToCopy = ['Dockerfile'];

  const copyPromises = filesToCopy.map((file) =>
    fs.copy(
      path.join(templatesFolder, file),
      path.join(process.cwd(), generatedProjectFolder, file),
    ),
  );

  return Promise.all(copyPromises);
};
/**
 * Copies files to the 'src' directory of the generated project folder.
 *
 * @param {GenerateOptions} options - The options for generating the files.
 * @param {string} generatedProjectFolder - The path of the generated project folder.
 * @return {Promise<void[]>} A promise that resolves when all the files are copied.
 */
export const copyFilesToSrc = async (
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

  const filesToCopy = mapOptionsToArrayOfData(options, optionsToFiles);

  const copyPromises = filesToCopy.map((file) =>
    fs.copy(
      path.join(templatesFolder, file),
      path.join(process.cwd(), generatedProjectFolder, 'src', file),
    ),
  );

  return Promise.all(copyPromises);
};
export const copyDbFiles = async (generatedProjectFolder: string) => {
  const filesToCopy = mongoDBCopyFiles;

  const copyPromises = filesToCopy.map((file) =>
    fs.copy(
      path.join(templatesFolder, file),
      path.join(process.cwd(), generatedProjectFolder, 'src', file),
    ),
  );

  return Promise.all(copyPromises);
};
