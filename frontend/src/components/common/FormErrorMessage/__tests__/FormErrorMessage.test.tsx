import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FormErrorMessage from '../FormErrorMessage'; 
import styles from '../FormErrorMessage.module.css';

describe('Componente FormErrorMessage', () => {

    it('deve renderizar a mensagem de erro quando children for fornecido', () => {
        
        const errorMessage = "Credenciais inválidas!";
        render(<FormErrorMessage>{errorMessage}</FormErrorMessage>);

        const messageElement = screen.getByText(errorMessage);

        expect(messageElement).toBeInTheDocument();
        expect(messageElement).toHaveClass(styles.errorMessage);
    });

    it('não deve renderizar nada quando children for null', () => {
    
        const { container } = render(<FormErrorMessage>{null}</FormErrorMessage>);

        const messageElement = container.querySelector(`.${styles.errorMessage}`); 
        expect(messageElement).not.toBeInTheDocument(); 
    });

    it('não deve renderizar nada quando children for undefined', () => {
     
        const { container } = render(<FormErrorMessage />);

        const messageElement = container.querySelector(`.${styles.errorMessage}`);
        expect(messageElement).not.toBeInTheDocument();
    });

    it('não deve renderizar nada quando children for uma string vazia', () => {
       
        const { container } = render(<FormErrorMessage>{''}</FormErrorMessage>);

        const messageElement = container.querySelector(`.${styles.errorMessage}`);
        expect(messageElement).not.toBeInTheDocument();
    });

     it('deve aplicar classes externas junto com a classe do módulo', () => {
        const errorMessage = "Erro com classe extra";
        const externalClass = "my-custom-error-style";
       
        render(<FormErrorMessage className={externalClass}>{errorMessage}</FormErrorMessage>);

        const messageElement = screen.getByText(errorMessage);

        expect(messageElement).toHaveClass(styles.errorMessage); 
        expect(messageElement).toHaveClass(externalClass);
    });

});