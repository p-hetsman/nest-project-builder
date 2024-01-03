
import { render, fireEvent, waitFor } from '@testing-library/react';
import SubmitForm from './generator-content';

// Test case: Render form with initial state
test('renders form with initial state', () => {
    render(<SubmitForm />);
});

test('disables submit button when project name is invalid', () => {
    const { getByLabelText, getByText } = render(<SubmitForm />);

    // Enter invalid project name
    const projectNameInput = getByLabelText('Project Name:');
    fireEvent.change(projectNameInput, { target: { value: 'Invalid Name' } });

    // Check if submit button is disabled
    const submitButton = getByText('Submit');

    // Retrieve the 'disabled' attribute and assert its presence
    expect(submitButton.getAttribute('disabled')).toBeDefined();
});
