import React from 'react';
import styles from './FormErrorMessage.module.css'; // Import the CSS Module

interface FormErrorMessageProps {
  children: React.ReactNode; // Accept the error message as children
  className?: string; // Allow external classes
}

const FormErrorMessage: React.FC<FormErrorMessageProps> = ({ children, className }) => {
  // If there are no children (e.g., error state is null or empty string),
  // don't render anything.
  if (!children) {
    return null;
  }

  // Combine internal style with external className if provided
  const combinedClasses = `${styles.errorMessage} ${className || ''}`.trim();

  // Render the error message, applying the CSS module class
  return (
    <div className={combinedClasses}> {/* Use div for better block layout control */}
      {children}
    </div>
  );
};

export default FormErrorMessage;