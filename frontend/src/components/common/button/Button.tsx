import React from 'react';
import styles from './Button.module.css'; // <-- Importa o CSS Module

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
    className, // <-- Recebe className externo se houver
    type = 'button',
    ...rest
}) => {
    const isDisabled = disabled || isLoading;

    // Combina a classe base com a classe de desabilitado se necessário
    // E permite adicionar classes externas passadas via props
    const buttonClasses = `
        ${styles.button}
        ${isDisabled ? styles.buttonDisabled : ''}
        ${className || ''}
    `;

    return (
        <button
            type={type}
            disabled={isDisabled}
            // Remove o style inline, usa className
            className={buttonClasses.trim()} // trim() para remover espaços extras
            {...rest}
        >
            {isLoading ? loadingText : children}
        </button>
    );
};

export default Button;