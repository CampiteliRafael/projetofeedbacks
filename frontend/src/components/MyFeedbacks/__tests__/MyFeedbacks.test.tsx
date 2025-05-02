import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom'; 
import { AuthContext, AuthContextData } from '../../../context/AuthContext';
import MyFeedbacks from '../MyFeedbacks';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('Página MyFeedbacks', () => {
   
    const mockUser = { id: 'user123', username: 'TestUser', role: 'user' };
    const mockContextValue: AuthContextData = {
        user: mockUser,
        isLoading: false, 
        login: vi.fn(),
        logout: vi.fn(),
    };

    // Helper para renderizar
    const renderMyFeedbacks = () => {
        return render(
            <AuthContext.Provider value={mockContextValue}>
                <MemoryRouter> 
                    <MyFeedbacks />
                </MemoryRouter>
            </AuthContext.Provider>
        );
    };

    beforeEach(() => {
        server.resetHandlers();
        localStorage.setItem('token', 'mock-user-token');
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('deve mostrar mensagem de carregamento inicialmente', () => {
        renderMyFeedbacks();
        expect(screen.getByText(/carregando seus feedbacks/i)).toBeInTheDocument();
    });

    it('deve exibir a lista de feedbacks do usuário após carregar com sucesso', async () => {
       
        renderMyFeedbacks();

        expect(await screen.findByText(/Meu primeiro feedback \(aprovado\)/i)).toBeInTheDocument();
        expect(await screen.findByText(/Meu segundo feedback \(rejeitado\)/i)).toBeInTheDocument();

        const statusAprovado = await screen.findByText('aprovado');
        expect(statusAprovado).toBeInTheDocument();
      

        const statusRejeitado = await screen.findByText('rejeitado');
        expect(statusRejeitado).toBeInTheDocument();
        
        expect(screen.queryByText(/carregando seus feedbacks/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/erro/i)).not.toBeInTheDocument();
    });

    it('deve exibir mensagem de lista vazia se a API retornar um array vazio', async () => {
        
        server.use(
            http.get('http://localhost:5000/api/feedbacks/my-feedbacks', () => {
                return HttpResponse.json([], { status: 200 });
            })
        );
        renderMyFeedbacks();

        expect(await screen.findByText(/Você ainda não enviou nenhum feedback/i)).toBeInTheDocument();
        expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/erro/i)).not.toBeInTheDocument();
    });

    it('deve exibir mensagem de erro se a API falhar', async () => {
      
        server.use(
            http.get('http://localhost:5000/api/feedbacks/my-feedbacks', () => {
                return HttpResponse.json({ message: 'Erro interno simulado!' }, { status: 500 });
            })
        );
        renderMyFeedbacks();

        expect(await screen.findByText(/Erro: Erro interno simulado!/i)).toBeInTheDocument();
        expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Meu primeiro feedback/i)).not.toBeInTheDocument();
    });

});