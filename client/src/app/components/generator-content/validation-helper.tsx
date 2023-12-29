export const isValidProjectName = projectName => {
    const regex = /^[a-zA-Z0-9-]+$/;
    return regex.test(projectName);
};
export const isValidURL = url => {
    const urlPattern = new RegExp(
        '(https://www.|http://www.|https://|http://)?[a-zA-Z]{2,}(.[a-zA-Z]{2,})(.[a-zA-Z]{2,})?/[a-zA-Z0-9]{2,}|((https://www.|http://www.|https://|http://)?[a-zA-Z]{2,}(.[a-zA-Z]{2,})(.[a-zA-Z]{2,})?)|(https://www.|http://www.|https://|http://)?[a-zA-Z0-9]{2,}.[a-zA-Z0-9]{2,}.[a-zA-Z0-9]{2,}(.[a-zA-Z0-9]{2,})? ',
    );
    return urlPattern.test(url);
};
