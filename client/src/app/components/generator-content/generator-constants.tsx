import { generateAuthObjects, getStrategiesFormData } from './submit-helper';

export const commonStrategy = ['clientID', 'clientSecret', 'callbackURL'];
export const OpenidStrategy = [
    'clientID',
    'clientSecret',
    'callbackURL',
    'trustIssuer',
];

export enum AuthTypes {
    google = 'Google',
    facebook = 'Facebook',
    openid = 'Openid',
}

export const enum StrategyNames {
    authGoogleStrategy = 'authGoogleStrategy',
    authFacebookStrategy = 'authFacebookStrategy',
    authOpenidStrategy = 'authOpenidStrategy',
}

const generatedAuthObjects = generateAuthObjects();

export interface checkboxListType {
    name: string;
    label: string;
    strategy?: { name: string; value: unknown[] };
}
export const checkboxList: checkboxListType[] = [
    { name: 'allExceptions', label: 'All Exceptions' },
    { name: 'logger', label: 'Logger' },
    { name: 'validation', label: 'Validation' },
    { name: 'cors', label: 'Cors' },
    { name: 'swagger', label: 'Swagger' },
    { name: 'helmet', label: 'Helmet' },
    { name: 'authJwt', label: 'Auth JWT' },
    ...generatedAuthObjects,
];

export const initFormState = {
    projectName: '',
    allExceptions: false,
    logger: false,
    validation: false,
    cors: false,
    swagger: false,
    helmet: false,
    authJwt: false,
    authGoogle: false,
    authFacebook: false,
    authOpenid: false,
};

export const initStrategiesState = {
    ...getStrategiesFormData(checkboxList),
};

export const initStrategiesBooleanState = {
    ...getStrategiesFormData(checkboxList, true),
};
