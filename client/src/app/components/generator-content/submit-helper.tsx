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
