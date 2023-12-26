import { useState } from 'react';
import { Button, Checkbox, Input } from '@nextui-org/react';

import { isValidProjectName } from './validation-helper';
import {
    checkboxList,
    initFormState,
    initStrategiesState,
} from './generator-constants';
import ModalPopUp from './modal-popup/modal-popup';
import { handleSubmit } from './submit-helper';
import SpinnerOverlay from './spinner-overlay';

export default function SubmitForm() {
    const [formData, setFormData] = useState({ ...initFormState });
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
    const [isTouched, setIsTouched] = useState(false);
    const [strategiesFormData, setStrategiesFormData] =
        useState(initStrategiesState);
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
                setIsTouched(false);
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

        // Reset data if checkbox is deselected
        if (!checked) {
            resetFormData(name);
        }

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
    const handleBlur = () => {
        setIsTouched(true);
    };
    const isInvalid = !isValidProjectName(projectName) && isTouched;

    const handleStrategiesInputChange = (strategy, field, value) => {
        setStrategiesFormData(prevFormData => ({
            ...prevFormData,
            [strategy]: {
                ...prevFormData[strategy],
                [field]: value,
            },
        }));
    };

    const renderInputs = strategy => {
        return Object.keys(strategiesFormData[strategy]).map((field, index) => (
            <input
                key={index}
                onChange={e =>
                    handleStrategiesInputChange(strategy, field, e.target.value)
                }
                placeholder={field}
                type="text"
                value={strategiesFormData[strategy][field]}
            />
        ));
    };
    const resetFormData = label => {
        const initialData = initStrategiesState;
        const strategyName = label + 'Strategy';

        setStrategiesFormData(prevData => ({
            ...prevData,
            [strategyName]: { ...initialData.authGoogleStrategy },
        }));
    };
    return (
        <div>
            {isLoading && <SpinnerOverlay />}
            <form className="flex flex-col  gap-4 " onSubmit={submission}>
                <Input
                    autoComplete="off"
                    color={
                        !isValidProjectName(projectName) && isTouched
                            ? 'danger'
                            : 'success'
                    }
                    errorMessage={
                        isInvalid && 'Please enter a valid project name'
                    }
                    isInvalid={isInvalid}
                    label="Project Name:"
                    name="projectName"
                    onBlur={handleBlur}
                    onChange={handleChange}
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
                        {checkboxStates[item.name] && item.strategy?.name && (
                            <div>{renderInputs(item.strategy?.name)}</div>
                        )}
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
