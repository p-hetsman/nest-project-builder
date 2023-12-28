import { Input } from '@nextui-org/react';
import React, { useEffect } from 'react';

function StrategyInputs({
    strategyName,
    strategiesFormData,
    handleStrategiesInputChange,
    validity,
    handleInputsBlur,
    touchedFields,
    setHasError,
}) {
    useEffect(() => {
        const hasInputError = Object.keys(
            strategiesFormData[strategyName],
        ).some(
            field =>
                !validity?.[strategyName]?.[field] &&
                touchedFields?.[strategyName]?.[field],
        );

        setHasError(hasInputError);
    }, [
        strategyName,
        validity,
        touchedFields,
        strategiesFormData,
        setHasError,
    ]);

    const RenderInputs = strategy => {
        return Object.keys(strategiesFormData[strategy]).map((field, index) => {
            const isFieldInvalid =
                !validity?.[strategy]?.[field] &&
                touchedFields?.[strategy]?.[field];
            const errorMessage = isFieldInvalid ? `Invalid ${field}` : '';

            return (
                <Input
                    autoComplete="off"
                    color={isFieldInvalid ? 'danger' : 'success'}
                    errorMessage={errorMessage}
                    key={index}
                    onBlur={() => handleInputsBlur(strategy, field)}
                    onChange={e =>
                        handleStrategiesInputChange(
                            strategy,
                            field,
                            e.target.value,
                        )
                    }
                    placeholder={field}
                    type="text"
                    value={strategiesFormData[strategy][field]}
                    variant="bordered"
                />
            );
        });
    };

    return (
        <div style={{ display: 'flex', gap: '2rem' }}>
            {RenderInputs(strategyName)}
        </div>
    );
}

export default StrategyInputs;
