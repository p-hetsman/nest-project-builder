import {
    AuthTypes,
    commonStrategy,
    OpenidStrategy,
    StrategyNames,
} from './generator-constants';
import { isValidProjectName } from './validation-helper';
import axios from 'axios';

export const handleSubmit = async (event, formData) => {
    event.preventDefault();
    const { projectName } = formData;

    if (!projectName || !isValidProjectName(projectName)) {
        return;
    }

    try {
        const response = await axios.post(
            process.env.GENERATOR_URL ?? 'url_var_error',
            formData,
        );

        if (response.statusText) {
            return await { text: 'Form submitted successfully!' };
        }

        return await { text: 'Form submission failed.' };
    } catch (error) {
        return await {
            text: 'An error occurred while submitting the form',
            details: error.message,
        };
    }
};
export const mapAuthTypeToKey = (authType: AuthTypes): string => {
    return `auth${authType.charAt(0).toUpperCase()}${authType.slice(1)}`;
};
export const mapAuthTypeToStrategyName = (
    authType: AuthTypes,
): StrategyNames | undefined => {
    switch (authType) {
        case AuthTypes.google:
            return StrategyNames.authGoogleStrategy;
        case AuthTypes.facebook:
            return StrategyNames.authFacebookStrategy;
        case AuthTypes.openid:
            return StrategyNames.authOpenidStrategy;
        default:
            return undefined;
    }
};

export const generateAuthObjects = (): {
    name: string;
    label: string;
    strategy: { name: string; value: any };
}[] => {
    const authObjects = Object.keys(AuthTypes).map(key => {
        const authType = AuthTypes[key as keyof typeof AuthTypes];

        return {
            name: mapAuthTypeToKey(authType),
            label: 'Auth ' + authType,
            strategy: {
                name: mapAuthTypeToStrategyName(authType),
                value:
                    authType === AuthTypes.openid
                        ? OpenidStrategy
                        : commonStrategy,
            },
        };
    });
    return authObjects;
};

export const getStrategiesFormData = checkboxList =>
    checkboxList
        .filter(item => item.strategy)
        .reduce((formData, item) => {
            const { strategy } = item;
            const strategyObject = {};
            strategy.value.forEach(prop => {
                strategyObject[prop] = '';
            });
            formData[strategy.name] = strategyObject;
            return formData;
        }, {});
