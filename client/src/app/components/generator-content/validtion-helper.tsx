export const isValidProjectName = projectName => {
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(projectName);
};

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

        if (response.ok) {
            // eslint-disable-next-line no-console
            console.log('Form submitted successfully!');
        } else {
            // eslint-disable-next-line no-console
            console.error('Form submission failed.');
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('An error occurred while submitting the form:', error);
    }
};
