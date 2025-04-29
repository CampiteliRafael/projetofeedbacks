import React from 'react';
import styles from './Button.module.css'; 
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    loadingText?: string;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    isLoading = false,
    loadingText = 'Carregando...',
    disabled = false,
    className, 
    type = 'button',
    ...rest
}) => {
    const isDisabled = disabled || isLoading;

    const buttonClasses = `
        ${styles.button}
        ${isDisabled ? styles.buttonDisabled : ''}
        ${className || ''}
    `;

    return (
        <button
            type={type}
            disabled={isDisabled}
            className={buttonClasses.trim()} 
            {...rest}
        >
            {isLoading ? loadingText : children}
        </button>
    );
};

export default Button;