import { Input } from '@nextui-org/react';
import React from 'react';

const isValidURL = url => {
    const urlPattern = new RegExp(
        '(https://www.|http://www.|https://|http://)?[a-zA-Z]{2,}(.[a-zA-Z]{2,})(.[a-zA-Z]{2,})?/[a-zA-Z0-9]{2,}|((https://www.|http://www.|https://|http://)?[a-zA-Z]{2,}(.[a-zA-Z]{2,})(.[a-zA-Z]{2,})?)|(https://www.|http://www.|https://|http://)?[a-zA-Z0-9]{2,}.[a-zA-Z0-9]{2,}.[a-zA-Z0-9]{2,}(.[a-zA-Z0-9]{2,})? ',
    );
    return urlPattern.test(url);
};
function StrategyInputs({
    strategyName,
    strategiesFormData,
    handleStrategiesInputChange,
}) {
    const renderInputs = strategy => {
        return Object.keys(strategiesFormData[strategy]).map((field, index) => (
            <Input
                autoComplete="off"
                errorMessage={
                    field === 'callbackURL' &&
                    !isValidURL(strategiesFormData[strategy][field])
                        ? 'Invalid URL'
                        : ''
                }
                key={index}
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

    return <div style={{ display: 'flex' }}>{renderInputs(strategyName)}</div>;
}

export default StrategyInputs;
