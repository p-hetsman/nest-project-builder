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
    const RenderInputs = strategy => {
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
