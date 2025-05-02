import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import InputField from '../InputField'; 
import { vi } from 'vitest';

describe('Componente InputField', () => {
  
    const mockOnChange = vi.fn();

    beforeEach(() => {
        mockOnChange.mockClear();
    });

    it('deve renderizar um input type="text" por padrão', () => {
       
        render(<InputField type="text" value="" onChange={mockOnChange} placeholder="Digite algo" />);

        const inputElement = screen.getByPlaceholderText('Digite algo');

        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toBeInstanceOf(HTMLInputElement);
        expect(inputElement).toHaveAttribute('type', 'text');
    });

    it('deve renderizar um input type="password"', () => {
        
        render(<InputField type="password" value="" onChange={mockOnChange} placeholder="Senha" />);

        const inputElement = screen.getByPlaceholderText('Senha');

        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toBeInstanceOf(HTMLInputElement);
        expect(inputElement).toHaveAttribute('type', 'password');
    });

    it('deve renderizar um textarea quando as="textarea" for passado', () => {
    
        render(<InputField as="textarea" value="" onChange={mockOnChange} placeholder="Mensagem" />);

        const textareaElement = screen.getByPlaceholderText('Mensagem');

        expect(textareaElement).toBeInTheDocument();
        expect(textareaElement).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('deve exibir o label corretamente quando a prop label for fornecida', () => {
      
        const labelText = "Nome de Usuário";
        render(<InputField type="text" value="" onChange={mockOnChange} label={labelText} id="username-input" />);

        const labelElement = screen.getByText(labelText);
    
        const inputElement = screen.getByLabelText(labelText);

        expect(labelElement).toBeInTheDocument();
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toHaveAttribute('id', 'username-input');
    });

    it('deve exibir o valor inicial passado pela prop value', () => {
       
        const initialValue = "Texto inicial";
        render(<InputField type="text" value={initialValue} onChange={mockOnChange} />);

        const inputElement = screen.getByDisplayValue(initialValue);

        expect(inputElement).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveValue(initialValue);
    });

    it('deve chamar a função onChange quando o usuário digita no input', async () => {
    
        const user = userEvent.setup(); 
        render(<InputField type="text" value="" onChange={mockOnChange} placeholder="Digite aqui" />);
        const inputElement = screen.getByPlaceholderText('Digite aqui');

        await user.type(inputElement, 'abc');

        expect(mockOnChange).toHaveBeenCalledTimes(3);
        expect(mockOnChange).toHaveBeenLastCalledWith(expect.objectContaining({ target: expect.objectContaining({ value: expect.any(String) }) }));
    });

    it('deve chamar a função onChange quando o usuário digita no textarea', async () => {
        
        const user = userEvent.setup();
        render(<InputField as="textarea" value="" onChange={mockOnChange} placeholder="Digite aqui" />);
        const textareaElement = screen.getByPlaceholderText('Digite aqui');

        await user.type(textareaElement, 'def');

        expect(mockOnChange).toHaveBeenCalledTimes(3);
    });

    it('deve ter o atributo disabled quando a prop disabled for true', () => {
       
        render(<InputField type="text" value="" onChange={mockOnChange} placeholder="Desabilitado" disabled />);
        const inputElement = screen.getByPlaceholderText('Desabilitado');

        expect(inputElement).toBeDisabled();
    });

    it('deve ter o atributo required quando a prop required for true', () => {
        
        render(<InputField type="text" value="" onChange={mockOnChange} placeholder="Obrigatório" required />);
        const inputElement = screen.getByPlaceholderText('Obrigatório');

        expect(inputElement).toBeRequired();
    });

     it('deve passar props extras (como name) para o elemento input/textarea', () => {
      
        render(<InputField type="email" value="" onChange={mockOnChange} placeholder="Email" name="user_email" />);
        const inputElement = screen.getByPlaceholderText('Email');

        expect(inputElement).toHaveAttribute('name', 'user_email');
    });
});