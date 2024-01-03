enum AuthStrategies {
  authGoogle = 'authGoogle',
  authFacebook = 'authFacebook',
  authOpenid = 'authOpenid',
}

export interface AuthStrategy {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  trustIssuer?: string;
}

export interface AuthData {
  [AuthStrategies.authGoogle]: AuthStrategy;
  [AuthStrategies.authFacebook]: AuthStrategy;
  [AuthStrategies.authOpenid]: AuthStrategy;
}

export type GenerateOptions = {
  projectName: string;
  allExceptions: boolean;
  logger: boolean;
  validation: boolean;
  cors: boolean;
  swagger: boolean;
  postgres: boolean;
  authJwt: boolean;
  authGoogle: boolean;
  authFacebook: boolean;
  authOpenid: boolean;
  strategies?: AuthData;
};
