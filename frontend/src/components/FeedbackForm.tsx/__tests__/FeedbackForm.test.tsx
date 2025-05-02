import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest'; 
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest'; 
import { AuthContext, AuthContextData } from '../../../context/AuthContext';
import FeedbackForm from '../FeedbackForm';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

vi.mock('../../common/FormErrorMessage/FormErrorMessage', () => ({
    default: ({ children }: { children?: React.ReactNode }) => children ? <div data-testid="error-message">{children}</div> : null,
    
}));


describe('Componente FeedbackForm', () => {
    // Mocks
    const mockOnSent = vi.fn();
    const mockUser = { id: 'user123', username: 'TestFormUser', role: 'user' };
    const mockToken = 'mock-valid-token-string';

    // Helper para renderizar com contexto
    const renderFeedbackForm = () => {
        const mockContextValue: AuthContextData = {
            user: mockUser,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
        };
        return render(
            <AuthContext.Provider value={mockContextValue}>
                <FeedbackForm onSent={mockOnSent} />
            </AuthContext.Provider>
        );
    };

    beforeEach(() => {
        mockOnSent.mockClear();
        server.resetHandlers(); 
        localStorage.clear(); 
    });

    afterEach(() => {
        localStorage.clear(); 
    });

    it('deve renderizar o formulário corretamente', () => {
        renderFeedbackForm();
        expect(screen.getByRole('heading', { name: /enviar feedback/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/digite sua mensagem aqui/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
    });

    it('deve atualizar o estado da mensagem ao digitar no textarea', async () => {
        const user = userEvent.setup();
        renderFeedbackForm();
        const textarea = screen.getByPlaceholderText(/digite sua mensagem aqui/i);

        await user.type(textarea, 'Nova mensagem');

        expect(textarea).toHaveValue('Nova mensagem');
    });

    it('deve chamar a API (via sendFeedback), limpar o campo e chamar onSent em caso de sucesso', async () => {
        const user = userEvent.setup();
        renderFeedbackForm();

        const textarea = screen.getByPlaceholderText<HTMLTextAreaElement>(/digite sua mensagem aqui/i); 
        const submitButton = screen.getByRole('button', { name: /enviar/i });
        const testMessage = 'Feedback de sucesso!';

        localStorage.setItem('token', mockToken);

        await user.type(textarea, testMessage);
        await user.click(submitButton);

        expect(await screen.findByRole('button', { name: /enviando/i })).toBeInTheDocument();

        await waitFor(() => {
            expect(mockOnSent).toHaveBeenCalledTimes(1);
        });

        await waitFor(() => {
           expect(textarea.value).toBe(''); 
        });

        expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /enviar/i })).not.toBeDisabled();

        expect(screen.queryByTestId("error-message")).not.toBeInTheDocument(); 
    });

    it('deve exibir mensagem de erro se a API retornar erro (ex: 400)', async () => {
         const user = userEvent.setup();
        renderFeedbackForm();

        const textarea = screen.getByPlaceholderText<HTMLTextAreaElement>(/digite sua mensagem aqui/i);
        const submitButton = screen.getByRole('button', { name: /enviar/i });
        const testMessage = 'Feedback com erro 400';
        const erroMockado = 'Erro simulado do backend 400!';

         localStorage.setItem('token', mockToken);
        
         server.use(
             http.post('http://localhost:5000/api/feedbacks', () => {
                 return HttpResponse.json({ message: erroMockado }, { status: 400 });
             })
        );

        await user.type(textarea, testMessage);
        await user.click(submitButton);

        const errorMessageContainer = await screen.findByTestId("error-message");
        expect(errorMessageContainer).toBeInTheDocument();
        expect(errorMessageContainer).toHaveTextContent(erroMockado);

        expect(mockOnSent).not.toHaveBeenCalled();
        expect(textarea.value).toBe(testMessage); 
    });

     it('deve exibir mensagem de erro genérica se ocorrer erro de rede', async () => {
        const user = userEvent.setup();
        renderFeedbackForm();

        const textarea = screen.getByPlaceholderText<HTMLTextAreaElement>(/digite sua mensagem aqui/i);
        const submitButton = screen.getByRole('button', { name: /enviar/i });
        const testMessage = 'Feedback com erro de rede';

        localStorage.setItem('token', mockToken);
      
         server.use(
            http.post('http://localhost:5000/api/feedbacks', () => {
                return HttpResponse.error(); 
            })
        );

        await user.type(textarea, testMessage);
        await user.click(submitButton);

         const errorMessageContainer = await screen.findByTestId("error-message"); 
         expect(errorMessageContainer).toBeInTheDocument();
         expect(errorMessageContainer).toHaveTextContent(/Failed to fetch/i); 

        expect(mockOnSent).not.toHaveBeenCalled();
        expect(textarea.value).toBe(testMessage); 
    });

});