export const isValidProjectName = projectName => {
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(projectName);
};
