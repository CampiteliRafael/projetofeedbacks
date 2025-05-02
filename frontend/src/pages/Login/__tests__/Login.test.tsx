import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext, AuthContextData } from '../../../context/AuthContext';
import Login from '../Login';
import { http, HttpResponse } from 'msw';
import { server } from '../../../mocks/server';
import { vi } from 'vitest';

describe('Página Login', () => {
    const mockLogin = vi.fn();
    let mockAuthContext: AuthContextData;

    // Helper para renderizar com contexto e router
    const renderLogin = () => {
        // Cria um valor de contexto mockado para cada teste
        mockAuthContext = {
            user: null,
            isLoading: false,
            login: mockLogin,
            logout: vi.fn(),
        };
        return render(
            <AuthContext.Provider value={mockAuthContext}>
                <MemoryRouter initialEntries={['/login']}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<div>Home Page</div>} />
                         <Route path="/my-feedbacks" element={<div>My Feedbacks Page</div>} />
                         <Route path="/feedbacks" element={<div>Admin Feedbacks Page</div>} />
                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        );
    };

    beforeEach(() => {
        mockLogin.mockClear();
         server.resetHandlers();
    });

    it('deve renderizar o formulário de login corretamente', () => {
        renderLogin();
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/nome de usuário/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/senha/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /registre-se/i })).toBeInTheDocument();
    });

    it('deve chamar a API e a função de login do contexto em caso de sucesso', async () => {
        const user = userEvent.setup();
        renderLogin();

        const usernameInput = screen.getByPlaceholderText(/nome de usuário/i);
        const passwordInput = screen.getByPlaceholderText(/senha/i);
        const loginButton = screen.getByRole('button', { name: /login/i });

        await user.type(usernameInput, 'testuser');
        await user.type(passwordInput, 'password');
        await user.click(loginButton);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledTimes(1);
            expect(mockLogin).toHaveBeenCalledWith('mock-token-user-123');
        });
    });

    it('deve exibir mensagem de erro se as credenciais estiverem incorretas', async () => {
         const user = userEvent.setup();
        renderLogin();

        const usernameInput = screen.getByPlaceholderText(/nome de usuário/i);
        const passwordInput = screen.getByPlaceholderText(/senha/i);
        const loginButton = screen.getByRole('button', { name: /login/i });

        await user.type(usernameInput, 'wronguser');
        await user.type(passwordInput, 'wrongpassword');
        await user.click(loginButton);

        const errorMessage = await screen.findByText(/credenciais inválidas \(mock\)/i);
        expect(errorMessage).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
    });

     it('deve exibir mensagem de erro genérica se a API falhar (ex: erro de rede)', async () => {
        const user = userEvent.setup();
        renderLogin();

        const usernameInput = screen.getByPlaceholderText(/nome de usuário/i);
        const passwordInput = screen.getByPlaceholderText(/senha/i);
        const loginButton = screen.getByRole('button', { name: /login/i });

        server.use(
            http.post('http://localhost:5000/api/auth/login', () => {
                return HttpResponse.error(); // Simula falha de rede
            })
        );

        await user.type(usernameInput, 'testuser');
        await user.type(passwordInput, 'password');
        await user.click(loginButton);

        const errorMessage = await screen.findByText(/Não foi possível conectar ao servidor/i);
        expect(errorMessage).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
     });

});