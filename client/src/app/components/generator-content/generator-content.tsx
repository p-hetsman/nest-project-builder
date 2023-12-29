import { useEffect, useState } from 'react';
import { Button, Checkbox, Input } from '@nextui-org/react';

import { isValidProjectName } from './validation-helper';
import {
    checkboxList,
    initFormState,
    initStrategiesBooleanState,
    initStrategiesState,
} from './generator-constants';
import ModalPopUp from './modal-popup/modal-popup';
import { checkInputs, handleSubmit, isValidURL } from './submit-helper';
import SpinnerOverlay from './spinner-overlay';
import StrategyInputs from './strategy-inputs/strategy-inputs';

/**
 * Renders a form with input fields, checkboxes, and a submit button.
 * Handles form submission, input changes, and validation.
 */
export default function SubmitForm() {
    // Initialize form state
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
    const [validity, setValidity] = useState(initStrategiesBooleanState);
    const [touchedFields, setTouchedFields] = useState(
        initStrategiesBooleanState,
    );

    const [hasError, setHasError] = useState(false);

    const { projectName } = formData;

    // Check if project name is invalid and has been touched
    const isInvalid = !isValidProjectName(projectName) && isTouched;
    // Update the button state based on error status
    useEffect(() => {
        const shouldDisableButton = checkInputs(
            checkboxStates,
            strategiesFormData,
            hasError,
            checkboxList,
        );

        const showButton =
            isValidProjectName(projectName) && !shouldDisableButton;
        setButtonDisabled(showButton);
    }, [checkboxStates, touchedFields, projectName, hasError]);

    const openModal = () => {
        setIsOpen(true);
    };
    /**
     * Handles form submission
     * @param {Event} e - The form submission event
     */
    const submission = e => {
        const submissionResult = handleSubmit(e, formData);
        setIsLoading(true);
        submissionResult.then(item => {
            if (item) {
                setIsLoading(false);
                setSubmissionText(item?.text);
                openModal();
                setIsTouched(false);
            }
        });

        // Reset form data and checkbox states
        setFormData(initFormState);
        setCheckboxStates(
            checkboxList.reduce(
                (acc, item) => ({ ...acc, [item.name]: false }),
                {},
            ),
        );
    };

    /**
     * Handles input "projectName" changes
     * @param {Event} event - The input change event
     */
    const handleChange = event => {
        const { name, value, type, checked } = event.target;
        const newValue = type === 'checkbox' ? checked : value;

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

    /**
     * Handles input "projectName" blur event
     */
    const handleBlur = () => {
        setIsTouched(true);
    };

    /**
     * Handles strategy input blur event
     * @param {string} strategy - The strategy name
     * @param {string} field - The field name
     */
    const handleInputsBlur = (strategy, field) => {
        setTouchedFields(touchedFields => ({
            ...touchedFields,
            [strategy]: {
                ...touchedFields[strategy],
                [field]: true,
            },
        }));
    };

    /**
     * Handles the input change for strategies.
     *
     * @param {string} strategy - The strategy name.
     * @param {string} field - The field being modified.
     * @param {string} value - The new value.
     */
    const handleStrategiesInputChange = (strategy, field, value) => {
        let isValidState = false;

        if (field === 'callbackURL' && isValidURL(value)) {
            isValidState = true;
        } else if (value.length > 0) {
            isValidState = true;
        }

        setValidity(prevValidity => ({
            ...prevValidity,
            [strategy]: {
                ...prevValidity[strategy],
                [field]: isValidState,
            },
        }));

        setStrategiesFormData(prevFormData => ({
            ...prevFormData,
            [strategy]: {
                ...prevFormData[strategy],
                [field]: value,
            },
        }));
    };

    const resetFormData = label => {
        const strategyName = label + 'Strategy';

        setStrategiesFormData(prevData => ({
            ...prevData,
            [strategyName]: { ...initStrategiesState[strategyName] },
        }));
        setValidity(prevData => ({
            ...prevData,
            [strategyName]: { ...initStrategiesBooleanState[strategyName] },
        }));
        setTouchedFields(prevData => ({
            ...prevData,
            [strategyName]: { ...initStrategiesBooleanState[strategyName] },
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
                            <StrategyInputs
                                handleInputsBlur={handleInputsBlur}
                                handleStrategiesInputChange={
                                    handleStrategiesInputChange
                                }
                                setHasError={setHasError}
                                strategiesFormData={strategiesFormData}
                                strategyName={item.strategy?.name}
                                touchedFields={touchedFields}
                                validity={validity}
                            />
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
