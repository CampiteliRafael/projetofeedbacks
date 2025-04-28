// src/components/common/InputField/InputField.tsx

import React from 'react';
import styles from './InputField.module.css';

interface InputFieldProps {
    // Adiciona a prop 'as' para escolher o elemento
    as?: 'input' | 'textarea'; // <-- NOVO

    // Tipo só se aplica a input, mas deixamos para compatibilidade geral de props
    type?: React.HTMLInputTypeAttribute;
    value: string | number; // Pode ser string ou number

    // Ajusta o tipo do onChange para aceitar ambos os eventos
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; // <-- MODIFICADO

    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    label?: string;
    id?: string;
    name?: string;
    className?: string;
    rows?: number; // Prop específica para textarea
    // Permite outras props de input ou textarea
    [key: string]: any;
}

const InputField: React.FC<InputFieldProps> = ({
    as = 'input', // <-- Define 'input' como padrão
    label,
    id,
    type = 'text', // Mantém 'text' como padrão para input
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    name,
    className,
    rows = 3, // Define um padrão de linhas para textarea
    ...rest
}) => {
    const elementId = id || `field-${name || type}-${Math.random().toString(36).substring(7)}`;

    const wrapperClasses = `${styles.wrapper} ${className || ''}`.trim();
    // Aplica as mesmas classes base e de desabilitado para ambos
    const elementClasses = `${styles.input} ${disabled ? styles.inputDisabled : ''}`.trim();

    // Renderiza o label se existir
    const labelElement = label ? (
        <label htmlFor={elementId} className={styles.label}>
            {label}
        </label>
    ) : null;

    // Renderiza input ou textarea condicionalmente
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
            rows={rows} // Usa a prop rows
            {...rest} // Passa outras props
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
            {...rest} // Passa outras props
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