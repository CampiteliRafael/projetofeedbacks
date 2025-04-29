import React from 'react';
import styles from './InputField.module.css';
interface InputFieldProps {
    as?: 'input' | 'textarea'; 

    type?: React.HTMLInputTypeAttribute;
    value: string | number; 

    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; 

    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    label?: string;
    id?: string;
    name?: string;
    className?: string;
    rows?: number; 
    [key: string]: any;
}

const InputField: React.FC<InputFieldProps> = ({
    as = 'input', 
    label,
    id,
    type = 'text', 
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    name,
    className,
    rows = 3, 
    ...rest
}) => {
    const elementId = id || `field-${name || type}-${Math.random().toString(36).substring(7)}`;

    const wrapperClasses = `${styles.wrapper} ${className || ''}`.trim();
    const elementClasses = `${styles.input} ${disabled ? styles.inputDisabled : ''}`.trim();

    const labelElement = label ? (
        <label htmlFor={elementId} className={styles.label}>
            {label}
        </label>
    ) : null;

    const inputElement = as === 'textarea' ? (
        <textarea
            id={elementId}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            name={name}
            className={elementClasses}
            rows={rows} 
            {...rest} 
        />
    ) : (
        <input
            id={elementId}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            name={name}
            className={elementClasses}
            {...rest} 
        />
    );

    return (
        <div className={wrapperClasses}>
            {labelElement}
            {inputElement}
        </div>
    );
};

export default InputField;