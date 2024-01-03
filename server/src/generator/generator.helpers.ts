import { readFile } from 'fs/promises';
import { AuthStrategy, GenerateOptions } from './types/generate-options';

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
