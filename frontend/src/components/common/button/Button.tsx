import React from 'react';

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
    type = 'button', 
    ...rest 
}) => {
  
    const isDisabled = disabled || isLoading;

    return (
        <button
            type={type}
            disabled={isDisabled} 
            {...rest} 
        >
            {isLoading ? loadingText : children}
        </button>
    );
};

export default Button;