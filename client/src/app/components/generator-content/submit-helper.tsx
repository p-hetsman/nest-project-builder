import {
    AuthTypes,
    commonStrategy,
    OpenidStrategy,
    StrategyNames,
} from './generator-constants';
import { isValidProjectName } from './validation-helper';
import axios from 'axios';

/**
 * Handles form submission.
 *
 * @param {Event} event - The form submission event.
 * @param {Object} formData - The form data.
 * @returns {Object} - The result of the form submission.
 */
export const handleSubmit = async (event, formData) => {
    event.preventDefault(); // Prevents the default form submission behavior
    const { projectName } = formData; // Destructure the projectName property from formData

    // Check if the projectName is empty or not a valid project name
    if (!projectName || !isValidProjectName(projectName)) {
        return; // Exit the function if the projectName is invalid
    }

    try {
        const response = await axios.post(
            process.env.GENERATOR_URL ?? 'url_var_error',
            formData,
        ); // Send a POST request to the generator URL with the form data

        // Check if the response has a statusText property
        if (response.statusText) {
            return { text: 'Form submitted successfully!' }; // Return success message
        }

        return { text: 'Form submission failed.' }; // Return failure message
    } catch (error) {
        return {
            text: 'An error occurred while submitting the form', // Return error message
            details: error.message, // Include error details
        };
    }
};
export const mapAuthTypeToKey = (authType: AuthTypes): string => {
    return `auth${authType.charAt(0).toUpperCase()}${authType.slice(1)}`;
};
export const mapAuthTypeToStrategyName = (
    authType: AuthTypes,
): StrategyNames | '' => {
    const strategyMap: { [key in AuthTypes]: StrategyNames } = {
        [AuthTypes.google]: StrategyNames.authGoogleStrategy,
        [AuthTypes.facebook]: StrategyNames.authFacebookStrategy,
        [AuthTypes.openid]: StrategyNames.authOpenidStrategy,
    };

    return strategyMap[authType] || '';
};

/**
 * Generates an array of authentication objects.
 * Each object contains a name, label, and strategy.
 * The name is mapped from the authentication type.
 * The label is the authentication type prefixed with 'Auth'.
 * The strategy is determined based on the authentication type.
 * If the authentication type is 'openid', the openid strategy is used.
 * Otherwise, the common strategy is used.
 *
 * @returns An array of authentication objects
 */
export const generateAuthObjects = (): {
    name: string;
    label: string;
    strategy: {
        name: StrategyNames | string;
        value: string[];
    };
}[] => {
    return Object.keys(AuthTypes).map(key => {
        const authType = AuthTypes[key as keyof typeof AuthTypes];
        const name = mapAuthTypeToKey(authType);
        const label = 'Auth ' + authType;
        const strategy = {
            name: mapAuthTypeToStrategyName(authType),
            value:
                authType === AuthTypes.openid ? OpenidStrategy : commonStrategy,
        };
        return { name, label, strategy };
    });
};

/**
 * Generate form data based on the provided checkbox list.
 *
 * @param {Array} checkboxList - The list of checkboxes.
 * @param {boolean} isBoolean - Indicates whether the form data values should be boolean or empty string.
 * @returns {Object} - The generated form data.
 */
export const getStrategiesFormData = (checkboxList, isBoolean = false) => {
    // Use reduce to generate the form data object
    const formData = checkboxList.reduce((acc, item) => {
        // Check if the item has a strategy property
        if (item.strategy) {
            const { strategy } = item;
            // Generate the strategy object with the values set to either boolean or empty string
            const strategyObject = strategy.value.reduce((obj, prop) => {
                obj[prop] = isBoolean ? false : '';
                return obj;
            }, {});

            // Add the strategy object to the form data with the strategy name as the key
            acc[strategy.name] = strategyObject;
        }

        return acc;
    }, {});

    return formData;
};

export const isValidURL = url => {
    const urlPattern = new RegExp(
        '(https://www.|http://www.|https://|http://)?[a-zA-Z]{2,}(.[a-zA-Z]{2,})(.[a-zA-Z]{2,})?/[a-zA-Z0-9]{2,}|((https://www.|http://www.|https://|http://)?[a-zA-Z]{2,}(.[a-zA-Z]{2,})(.[a-zA-Z]{2,})?)|(https://www.|http://www.|https://|http://)?[a-zA-Z0-9]{2,}.[a-zA-Z0-9]{2,}.[a-zA-Z0-9]{2,}(.[a-zA-Z0-9]{2,})? ',
    );
    return urlPattern.test(url);
};
export function checkInputs(
    checkboxStates,
    strategiesFormData,
    hasError,
    checkboxList,
): boolean {
    let shouldDisableButton = false;
    checkboxList.forEach(item => {
        if (checkboxStates[item.name] && item.strategy?.name) {
            const strategyName = item.strategy?.name;
            const emptyInputs = Object.values(
                strategiesFormData[strategyName],
            ).some((value: string) => value.trim() === '');
            if (emptyInputs || hasError) {
                shouldDisableButton = true;
            }
        }
    });
    return shouldDisableButton;
}
