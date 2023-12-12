import { isValidProjectName } from './validtion-helper';

//submission emulator
/* const mockFetch = async () => ({
    ok: false/true,
});
 */
export const handleSubmit = async (event, formData) => {
    event.preventDefault();
    const { projectName } = formData;

    if (!projectName || !isValidProjectName(projectName)) {
        return;
    }

    try {
        const response = await fetch(
            process.env.GENERATOR_URL ?? 'url_var_error',
            {
                method: 'Post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            },
        );
        //  const response = await mockFetch();

        if (response.ok) {
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
