import React from 'react';

interface InputFieldProps {
    
    type: React.HTMLInputTypeAttribute; 
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void; 
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    label?: string;
    id?: string; 
    name?: string; 
    
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    id,
    type = 'text', 
    value,
    onChange,
    placeholder,
    required = false, 
    disabled = false, 
    name, 
    ...rest 
}) => {
    const inputId = id || `input-${name || type}-${Math.random().toString(36).substring(7)}`;

    return (
        <div className="input-field-wrapper" style={{ marginBottom: '1rem' }}>
            {label && (
                <label htmlFor={inputId} style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                    {label}
                </label>
            )}
            <input
                id={inputId}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                name={name}
                {...rest}
            />
        </div>
    );
};

export default InputField;