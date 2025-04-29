import React from 'react';
import styles from './FormErrorMessage.module.css'; 

interface FormErrorMessageProps {
  children: React.ReactNode; 
  className?: string;
}

const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ children, className }) => {
  if (!children) {
    return null;
  }

  const combinedClasses = `${styles.errorMessage} ${className || ''}`.trim();

  return (
    <div className={combinedClasses}> 
      {children}
    </div>
  );
};

export default FormErrorMessage;