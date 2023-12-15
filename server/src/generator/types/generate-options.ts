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
};
