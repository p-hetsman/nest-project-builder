import { Input } from '@nextui-org/react';
import React from 'react';

function StrategyInputs({
    strategyName,
    strategiesFormData,
    handleStrategiesInputChange,
    validity,
    handleInputsBlur,
    touchedFields,
}) {
    const RenderInputs = strategy => {
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
