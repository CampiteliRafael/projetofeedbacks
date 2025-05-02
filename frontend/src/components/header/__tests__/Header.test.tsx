import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; 
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { AuthContext } from '../../../context/AuthContext'; 
import Header from '../Header'; 
import { vi } from 'vitest';

describe('Componente Header', () => {
    const mockLogout = vi.fn();
    const loggedOutContextValue = {
        user: null,
        isLoading: false, 
        login: vi.fn(), 
        logout: mockLogout,
    };

    beforeEach(() => {
        mockLogout.mockClear();
    });

    const renderHeader = (contextValue: any) => {
        return render(
            <AuthContext.Provider value={contextValue}>
                <MemoryRouter> 
                    <Header />
                </MemoryRouter>
            </AuthContext.Provider>
        );
    };

    it('deve renderizar links de Login e Registrar quando o usuário está deslogado', () => {

        renderHeader(loggedOutContextValue);

        expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');
        expect(screen.getByRole('link', { name: /registrar/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /registrar/i })).toHaveAttribute('href', '/register');

        expect(screen.queryByText(/olá,/i)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /sair/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /feedbacks/i })).not.toBeInTheDocument(); 
        expect(screen.queryByRole('link', { name: /criar feedback/i })).not.toBeInTheDocument();
    });

    it('deve renderizar mensagem de boas-vindas, links de usuário e botão Sair quando user normal está logado', () => {
     
        const userContextValue = {
            ...loggedOutContextValue, 
            user: { id: 'user1', username: 'TestUser', role: 'user' },
        };
        renderHeader(userContextValue);

        expect(screen.getByText(/olá, TestUser!/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /meus feedbacks/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /meus feedbacks/i })).toHaveAttribute('href', '/my-feedbacks');
        expect(screen.getByRole('link', { name: /criar feedback/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /criar feedback/i })).toHaveAttribute('href', '/');
        expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument();

        expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /registrar/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /listar feedbacks/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /painel admin/i })).not.toBeInTheDocument(); 
    });

     it('deve renderizar mensagem de boas-vindas, link de admin e botão Sair quando admin está logado', () => {
     
        const adminContextValue = {
            ...loggedOutContextValue,
            user: { id: 'admin1', username: 'TestAdmin', role: 'adm' },
        };
        renderHeader(adminContextValue);

        expect(screen.getByText(/olá, TestAdmin!/i)).toBeInTheDocument();
        const adminLink = screen.getByRole('link', { name: /painel admin|listar feedbacks/i });
        expect(adminLink).toBeInTheDocument();
        expect(adminLink).toHaveAttribute('href', '/feedbacks');
        expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument();

        expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /registrar/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /meus feedbacks/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /criar feedback/i })).not.toBeInTheDocument();
    });

    it('deve chamar a função logout do contexto quando o botão Sair é clicado', async () => {
     
        const user = userEvent.setup();
         const userContextValue = {
            ...loggedOutContextValue,
            user: { id: 'user1', username: 'TestUser', role: 'user' },
        };
        renderHeader(userContextValue);
        const logoutButton = screen.getByRole('button', { name: /sair/i });

        await user.click(logoutButton);

        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

});