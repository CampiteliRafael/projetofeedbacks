import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import Register from '../Register';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

// Mock da página de Login
const MockLoginPage = () => <div>Página de Login</div>;

// Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Página Register', () => {

    // Helper para renderizar com router
    const renderRegister = () => {
        return render(
            <MemoryRouter initialEntries={['/register']}>
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<MockLoginPage />} />
                </Routes>
            </MemoryRouter>
        );
    };

    beforeEach(() => {
        mockNavigate.mockClear();
        server.resetHandlers();
    });

    it('deve renderizar o formulário de registro corretamente', () => {
        renderRegister();
       
        expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Nome de usuário/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Senha/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /registrar/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /faça login/i })).toBeInTheDocument();
    });

    it('deve chamar a API e navegar para /login em caso de registro bem-sucedido', async () => {
        const user = userEvent.setup();
        renderRegister();

        const usernameInput = screen.getByPlaceholderText(/Nome de usuário/i);
        const passwordInput = screen.getByPlaceholderText(/Senha/i);
        const registerButton = screen.getByRole('button', { name: /registrar/i });

        await user.type(usernameInput, 'newUser');
        await user.type(passwordInput, 'newPassword');
        await user.click(registerButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
         expect(screen.queryByText(/erro/i)).not.toBeInTheDocument();
    });

    it('deve exibir mensagem de erro se o usuário já existir (erro 400)', async () => {
         const user = userEvent.setup();
        renderRegister();

        const usernameInput = screen.getByPlaceholderText(/Nome de usuário/i);
        const passwordInput = screen.getByPlaceholderText(/Senha/i);
        const registerButton = screen.getByRole('button', { name: /registrar/i });

        await user.type(usernameInput, 'existinguser');
        await user.type(passwordInput, 'anypassword');
        await user.click(registerButton);

        const errorMessage = await screen.findByText(/usuário já existe \(mock\)/i);
        expect(errorMessage).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('deve exibir mensagem de erro se ocorrer erro no servidor (erro 500)', async () => {
         const user = userEvent.setup();
        renderRegister();

        const usernameInput = screen.getByPlaceholderText(/Nome de usuário/i);
        const passwordInput = screen.getByPlaceholderText(/Senha/i);
        const registerButton = screen.getByRole('button', { name: /registrar/i });

        await user.type(usernameInput, 'servererror');
        await user.type(passwordInput, 'anypassword');
        await user.click(registerButton);

        const errorMessage = await screen.findByText(/erro interno simulado no registro/i);
        expect(errorMessage).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

     it('deve exibir mensagem de erro genérica se a API falhar (ex: erro de rede)', async () => {
        const user = userEvent.setup();
        renderRegister();

        const usernameInput = screen.getByPlaceholderText(/Nome de usuário/i);
        const passwordInput = screen.getByPlaceholderText(/Senha/i);
        const registerButton = screen.getByRole('button', { name: /registrar/i });

         server.use(
            http.post('http://localhost:5000/api/auth/register', () => {
                return HttpResponse.error();
            })
        );

        await user.type(usernameInput, 'anyuser');
        await user.type(passwordInput, 'anypassword');
        await user.click(registerButton);

        const errorMessage = await screen.findByText(/Não foi possível conectar ao servidor/i);
        expect(errorMessage).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

});