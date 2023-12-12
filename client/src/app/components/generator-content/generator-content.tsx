import { useState } from 'react';
import { Button, Checkbox, Input } from '@nextui-org/react';

import { isValidProjectName } from './validtion-helper';
import { checkboxList, initFormState } from './generator-constants';
import ModalPopUp from './modal-popup/modal-popup';
import { handleSubmit } from './submit-helper';
import SpinnerOverlay from './spinner-overlay';

export default function SubmitForm() {
    const [formData, setFormData] = useState(initFormState);
    const [isButtonDisabled, setButtonDisabled] = useState(false);
    const [checkboxStates, setCheckboxStates] = useState(
        checkboxList.reduce(
            (acc, item) => ({ ...acc, [item.name]: false }),
            {},
        ),
    );
    const [submissionText, setSubmissionText] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { projectName } = formData;

    const handleOpenModal = () => {
        setIsOpen(true);
    };

    const submission = e => {
        const submissionResult = handleSubmit(e, formData);
        setIsLoading(true);
        submissionResult.then(item => {
            if (item) {
                setIsLoading(false);
                setSubmissionText(item?.text);
                handleOpenModal();
            }
        });

        setFormData(initFormState);
        setCheckboxStates(
            checkboxList.reduce(
                (acc, item) => ({ ...acc, [item.name]: false }),
                {},
            ),
        );
    };

    const handleChange = event => {
        setButtonDisabled(true);

        if (!isValidProjectName(projectName)) {
            setButtonDisabled(false);
        }

        const { name, value, type, checked } = event.target;
        const newValue = type === 'checkbox' ? checked : value;
        setCheckboxStates(prevState => ({
            ...prevState,
            [name]: checked,
        }));

        if (name === 'projectName') {
            if (!isValidProjectName(newValue)) {
                setButtonDisabled(false);
            }
        }

        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: newValue,
        }));
    };

    return (
        <div>
            {isLoading && <SpinnerOverlay />}
            <form className="flex flex-col  gap-4 " onSubmit={submission}>
                <Input
                    autoComplete="off"
                    color={
                        !isValidProjectName(projectName) ? 'danger' : 'success'
                    }
                    errorMessage={
                        !isValidProjectName(projectName) &&
                        'Please enter a valid project name'
                    }
                    isInvalid={!isValidProjectName(projectName)}
                    label="Project Name:"
                    name="projectName"
                    onChange={e => handleChange(e)}
                    placeholder="Enter your project name"
                    type="text"
                    value={projectName}
                    variant="bordered"
                />

                {checkboxList.map(item => (
                    <div key={item.name}>
                        <Checkbox
                            isSelected={checkboxStates[item.name]}
                            key={item.name}
                            name={item.name}
                            onChange={e => handleChange(e)}
                            size="lg"
                            type="checkbox"
                            value={formData[item.name]}
                        >
                            {item.label}
                        </Checkbox>
                    </div>
                ))}

                <Button
                    color="primary"
                    isDisabled={!isButtonDisabled}
                    type="submit"
                >
                    Submit
                </Button>
            </form>

            {isOpen && (
                <ModalPopUp
                    isOpen={isOpen}
                    message={submissionText}
                    onOpenChange={setIsOpen}
                />
            )}
        </div>
    );
}
