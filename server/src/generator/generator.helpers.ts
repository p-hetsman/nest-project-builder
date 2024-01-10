import * as path from 'node:path';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

import * as ejs from 'ejs';

import {
  AuthData,
  AuthStrategy,
  GenerateOptions,
} from './types/generate-options';
import { packageJsonAuthJwt } from './constants';

const execPromise = promisify(exec);

export async function getProjectFileData(path: string) {
  try {
    const file = await readFile(path, 'utf8');
    const fileData = JSON.parse(file);
    return fileData;
  } catch (error) {
    console.error(`Error reading file ${path}:`, error);
    return null;
  }
}

export const mapOptionsToArrayOfData = <T>(
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
export function areKeysComplete(strategy: AuthStrategy): boolean {
  return (
    'clientID' in strategy &&
    'clientSecret' in strategy &&
    'callbackURL' in strategy
  );
}

export const strategies = {
  authGoogle: {
    clientID: 'googleClientId',
    clientSecret: 'googleClientSecret',
    callbackURL: 'googleCallbackURL',
  },
  authFacebook: {
    clientID: 'facebookClientId',
    clientSecret: 'facebookClientSecret',
    callbackURL: 'facebookCallbackURL',
  },
  authOpenid: {
    clientID: 'openidClientId',
    clientSecret: 'openidClientSecret',
    callbackURL: 'openidCallbackURL',
    trustIssuer: 'trustIssuerURL',
  },
};
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
  templatesFolder: string,
): Promise<void> => {
  const { authJwt, strategies } = options;

  if (!authJwt) {
    return;
  }

  const optionsToEnv: Record<string, string[]> = {};
  const authLength = 4;
  Object.keys(strategies).forEach((strategyKey) => {
    const strategy = strategies[strategyKey as keyof AuthData];
    if (areKeysComplete(strategy) && strategy) {
      const prefix = 'NEST_PUBLIC_';

      const suffix = '_CLIENT_SECRET';

      optionsToEnv[strategyKey] = [
        `
  ${prefix}${strategyKey.slice(authLength).toUpperCase()}_CLIENT_ID=${
    strategy.clientID
  }
  ${strategyKey.slice(authLength).toUpperCase()}${suffix}=${
    strategy.clientSecret
  }
  ${prefix}${strategyKey.slice(authLength).toUpperCase()}_CALLBACK_URL=${
    strategy.callbackURL
  }
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
  templatesFolder: string,
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
