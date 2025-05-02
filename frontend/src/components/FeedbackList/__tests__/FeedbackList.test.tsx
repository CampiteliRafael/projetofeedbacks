import styles from '../FeedbackList.module.css';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest'; 
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest'; 
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, AuthContextData } from '../../../context/AuthContext';
import FeedbackList from '../FeedbackList';
import { server } from '../../../mocks/server'; 
import { http, HttpResponse } from 'msw'; 

describe('Componente FeedbackList (Admin View)', () => {
    // Mock do usuário admin para o contexto
    const mockAdminUser = { id: 'admin1', username: 'TestAdmin', role: 'adm' };
    const mockContextValue: AuthContextData = { user: mockAdminUser, isLoading: false, login: vi.fn(), logout: vi.fn() };

    // Dados mockados iniciais (MSW vai usar estes ou overrides)
    const mockInitialFeedbacks = [
        { _id: 'fb1', name: 'User A', message: 'Feedback Pendente 1', userId: 'userA', status: 'pendente', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
        { _id: 'fb2', name: 'User B', message: 'Feedback Aprovado', userId: 'userB', status: 'aprovado', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { _id: 'fb3', name: 'User C', message: 'Feedback Pendente 2', userId: 'userC', status: 'pendente', createdAt: new Date().toISOString() },
    ];
    const mockInitialStats = { total: 3, pending: 2, approved: 1, rejected: 0 };

    const renderFeedbackList = () => {
        return render(
            <AuthContext.Provider value={mockContextValue}>
                <MemoryRouter>
                    <FeedbackList refreshTrigger={0} />
                </MemoryRouter>
            </AuthContext.Provider>
        );
    };

    beforeEach(() => {
        server.resetHandlers();
        server.use(
            http.get('http://localhost:5000/api/feedbacks', () => HttpResponse.json(mockInitialFeedbacks, { status: 200 })),
            http.get('http://localhost:5000/api/feedbacks/stats', () => HttpResponse.json(mockInitialStats, { status: 200 }))
        );
        localStorage.setItem('token', 'mock-admin-token');
        vi.restoreAllMocks(); 
    });

    afterEach(() => {
        localStorage.clear();
    });


    it('deve mostrar loading inicialmente e depois exibir estatísticas e lista de feedbacks', async () => {
        renderFeedbackList();

        expect(screen.getByText(/Carregando estatísticas.../i)).toBeInTheDocument();
        expect(screen.getByText(/Carregando feedbacks.../i)).toBeInTheDocument();

        expect(await screen.findByText(/Total:/i)).toHaveTextContent(`Total: ${mockInitialStats.total}`);
        expect(await screen.findByText(/Feedback Pendente 1/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/Pendente:/i)).toHaveTextContent(`Pendente: ${mockInitialStats.pending}`);
            expect(screen.getByText(/Aprovado:/i)).toHaveTextContent(`Aprovado: ${mockInitialStats.approved}`); 
            expect(screen.getByText(/Rejeitado:/i)).toHaveTextContent(`Rejeitado: ${mockInitialStats.rejected}`);
        })
    });

    it('deve exibir mensagem apropriada se não houver feedbacks', async () => {
    
        server.use(
            http.get('http://localhost:5000/api/feedbacks', () => HttpResponse.json([], { status: 200 })),
            http.get('http://localhost:5000/api/feedbacks/stats', () => HttpResponse.json({ total: 0, pending: 0, approved: 0, rejected: 0 }, { status: 200 }))
        );
        renderFeedbackList();

        expect(await screen.findByText(/nenhum feedback encontrado/i)).toBeInTheDocument();

        const totalStatElement = await screen.findByText(/Total:/i);
        expect(totalStatElement).toBeInTheDocument();
        expect(totalStatElement).toHaveTextContent('Total: 0');
        expect(screen.getByText(/Pendente:/i)).toHaveTextContent('Pendente: 0');
        expect(screen.getByText(/Aprovado:/i)).toHaveTextContent('Aprovado: 0');
        expect(screen.getByText(/Rejeitado:/i)).toHaveTextContent('Rejeitado: 0');
    });

    it('deve exibir mensagem de erro se a busca de feedbacks falhar', async () => {
        server.use(http.get('http://localhost:5000/api/feedbacks', () => HttpResponse.json({ message: 'Erro de DB simulado' }, { status: 500 })));
        renderFeedbackList();
        expect(await screen.findByText(/Erro: Erro de DB simulado/i)).toBeInTheDocument();
    });

    it('deve chamar a API de update e atualizar o status na UI ao clicar em Aprovar', async () => {
        const user = userEvent.setup();
        renderFeedbackList();

        const feedbackItem1 = await screen.findByText(/Feedback Pendente 1/i);
        const listItem = feedbackItem1.closest('li');
        expect(listItem).toBeInTheDocument();
        const approveButton = await within(listItem!).findByRole('button', { name: /aprovar/i });

        let patchCalled = false;
        server.use(
            http.patch('http://localhost:5000/api/feedbacks/fb1/status', async ({ request }) => {
                const body = await request.json() as any;
                expect(body.status).toBe('aprovado');
                patchCalled = true;
                const updatedData = { ...mockInitialFeedbacks.find(fb => fb._id === 'fb1')!, status: 'aprovado', updatedAt: new Date() };
                return HttpResponse.json(updatedData, { status: 200 });
            })
        );

        await user.click(approveButton);

        await waitFor(() => expect(patchCalled).toBe(true)); 

        const updatedStatusSpan = await within(listItem!).findByText('aprovado');
        expect(updatedStatusSpan).toBeInTheDocument();
        expect(updatedStatusSpan).toHaveClass(styles.status, styles.statusaprovado);

        await waitFor(() => {
            expect(within(listItem!).queryByRole('button', { name: /aprovar/i })).not.toBeInTheDocument();
            expect(within(listItem!).queryByRole('button', { name: /rejeitar/i })).not.toBeInTheDocument();
        });
    });

    it('deve chamar a API de delete e remover o item da lista ao clicar em Deletar', async () => {
        const user = userEvent.setup();
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        renderFeedbackList();

        const feedbackItem1 = await screen.findByText(/Feedback Pendente 1/i);
        const listItem = feedbackItem1.closest('li');
        expect(listItem).toBeInTheDocument();
        const deleteButton = await within(listItem!).findByRole('button', { name: /deletar/i });

        let deleteCalled = false;
        server.use(
            http.delete('http://localhost:5000/api/feedbacks/fb1', () => {
                deleteCalled = true;
                return new HttpResponse(null, { status: 200 }); 
            })
        );

        await user.click(deleteButton);

        await waitFor(() => expect(deleteCalled).toBe(true));

        await waitFor(() => {
            expect(screen.queryByText(/Feedback Pendente 1/i)).not.toBeInTheDocument();
        });

        confirmSpy.mockRestore();
    });

    it('deve chamar a API de update e atualizar o status na UI ao clicar em Rejeitar', async () => {
        const user = userEvent.setup();
        renderFeedbackList();

        const feedbackItem = await screen.findByText(/Feedback Pendente 2/i);
        const listItem = feedbackItem.closest('li');
        expect(listItem).toBeInTheDocument();
        const rejectButton = await within(listItem!).findByRole('button', { name: /rejeitar/i });

        let patchCalled = false;
        server.use(
            http.patch('http://localhost:5000/api/feedbacks/fb3/status', async ({ request }) => { // Usa ID fb3
                const body = await request.json() as any;
                expect(body.status).toBe('rejeitado');
                patchCalled = true;
                const updatedData = { ...mockInitialFeedbacks.find(fb => fb._id === 'fb3')!, status: 'rejeitado', updatedAt: new Date() };
                return HttpResponse.json(updatedData, { status: 200 });
            })
        );

        await user.click(rejectButton);

        await waitFor(() => expect(patchCalled).toBe(true));

        const updatedStatusSpan = await within(listItem!).findByText('rejeitado');
        expect(updatedStatusSpan).toBeInTheDocument();
        expect(updatedStatusSpan).toHaveClass(styles.status, styles.statusrejeitado); 

        await waitFor(() => {
            expect(within(listItem!).queryByRole('button', { name: /aprovar/i })).not.toBeInTheDocument();
            expect(within(listItem!).queryByRole('button', { name: /rejeitar/i })).not.toBeInTheDocument();
        });
    });

}); 