import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import Button from '../Button';
import { vi } from 'vitest';


describe('Componente Button', () => {

    it('deve renderizar corretamente com o children (texto)', () => {
    
        render(<Button>Clique Aqui</Button>);

        const buttonElement = screen.getByRole('button', { name: /clique aqui/i });

        expect(buttonElement).toBeInTheDocument();
    });

    it('deve chamar a função onClick quando clicado', async () => {
     
        const handleClickMock = vi.fn();
        render(<Button onClick={handleClickMock}>Test Click</Button>);
        const buttonElement = screen.getByRole('button', { name: /test click/i });

        await userEvent.click(buttonElement);

        expect(handleClickMock).toHaveBeenCalledTimes(1);
    });

    it('deve estar desabilitado quando a prop disabled for true', () => {
   
        render(<Button disabled>Desabilitado</Button>);
        const buttonElement = screen.getByRole('button', { name: /desabilitado/i });

        expect(buttonElement).toBeDisabled();
    });

    it('deve estar desabilitado e mostrar loadingText quando isLoading for true', () => {
        const loadingText = "Aguarde...";
      
        render(<Button isLoading loadingText={loadingText}>Enviar</Button>);
        const buttonElement = screen.getByRole('button', { name: loadingText }); 

        expect(buttonElement).toBeInTheDocument();
        expect(buttonElement).toBeDisabled(); 
        expect(buttonElement).toHaveTextContent(loadingText); 
        expect(screen.queryByText('Enviar')).not.toBeInTheDocument();
    });

     it('deve aplicar classes CSS do módulo e classes externas via className', () => {
        const externalClass = "my-custom-class";
     
        render(<Button className={externalClass}>Estilizado</Button>);
        const buttonElement = screen.getByRole('button', { name: /estilizado/i });

        expect(buttonElement).toHaveClass(externalClass);
        expect(buttonElement.className).toContain(externalClass); 
        expect(buttonElement.className.split(' ').length).toBeGreaterThan(1); 
    });

});