import { Input } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';

function StrategyInputs({
    strategyName,
    strategiesFormData,
    handleStrategiesInputChange,
    validity,
    handleInputsBlur,
    touchedFields,
    setHasError,
}) {
    const RenderInputs = strategy => {
        const [, setLocalError] = useState(true); // Local state to track error within the component

        // Update local error state based on input validity
        useEffect(() => {
            const hasInputError = Object.keys(
                strategiesFormData[strategyName],
            ).some(
                field =>
                    !validity?.[strategyName]?.[field] &&
                    touchedFields?.[strategyName]?.[field],
            );
            setLocalError(hasInputError);
            setHasError(hasInputError); // Update parent's error state
        }, [
            strategyName,
            validity,
            touchedFields,
            strategiesFormData,
            setHasError,
        ]);
        return Object.keys(strategiesFormData[strategy]).map((field, index) => (
            <Input
                autoComplete="off"
                color={
                    !validity?.[strategy]?.[field] &&
                    touchedFields?.[strategy]?.[field]
                        ? 'danger'
                        : 'success'
                }
                errorMessage={
                    !validity?.[strategy]?.[field] &&
                    touchedFields?.[strategy]?.[field]
                        ? `Invalid ${field}`
                        : ''
                }
                key={index}
                onBlur={() => {
                    handleInputsBlur(strategy, field);
                }}
                onChange={e =>
                    handleStrategiesInputChange(strategy, field, e.target.value)
                }
                placeholder={field}
                type="text"
                value={strategiesFormData[strategy][field]}
                variant="bordered"
            />
        ));
    };

    return (
        <div style={{ display: 'flex', gap: '2rem' }}>
            {RenderInputs(strategyName)}
        </div>
    );
}

export default StrategyInputs;
