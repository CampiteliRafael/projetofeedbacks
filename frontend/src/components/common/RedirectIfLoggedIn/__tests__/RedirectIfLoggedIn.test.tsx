import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import { AuthContext, AuthContextData } from '../../../../context/AuthContext';
import RedirectIfLoggedIn from '../RedirectIfLoggedIn';
import { vi } from 'vitest';

const MockPublicPage = () => <div>Página Pública (Login/Register)</div>;
const MockUserDashboard = () => <div>Painel do Usuário (/my-feedbacks)</div>;
const MockAdminDashboard = () => <div>Painel do Admin (/feedbacks)</div>;

describe('Componente RedirectIfLoggedIn', () => {
    const mockLogin = vi.fn();
    const mockLogout = vi.fn();

    const renderRedirectIfLoggedIn = (
        contextValue: Partial<AuthContextData>, 
        initialRoute = ['/public-page'] 
    ) => {
       
        const fullContextValue: AuthContextData = {
            user: null,
            isLoading: false,
            login: mockLogin,
            logout: mockLogout,
            ...contextValue, 
        };

        return render(
            <AuthContext.Provider value={fullContextValue}>
                <MemoryRouter initialEntries={initialRoute}>
                    <Routes>
                        {/* Rota pública que usa o wrapper */}
                        <Route
                            path="/public-page"
                            element={
                                <RedirectIfLoggedIn>
                                    <MockPublicPage />
                                </RedirectIfLoggedIn>
                            }
                        />
                        {/* Rotas de destino para os redirects */}
                        <Route path="/my-feedbacks" element={<MockUserDashboard />} />
                        <Route path="/feedbacks" element={<MockAdminDashboard />} />
                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        );
    };

    it('deve mostrar estado de carregamento quando isLoading for true', () => {
  
        const loadingContext = { isLoading: true };
  
        renderRedirectIfLoggedIn(loadingContext);
        
        expect(screen.getByText(/carregando/i)).toBeInTheDocument(); 
        expect(screen.queryByText(/página pública/i)).not.toBeInTheDocument();
    });

    it('deve renderizar children (página pública) se isLoading for false e user for null', () => {
        
        const loggedOutContext = { user: null, isLoading: false };
        
        renderRedirectIfLoggedIn(loggedOutContext);

        expect(screen.getByText(/página pública/i)).toBeInTheDocument();
        expect(screen.queryByText(/painel do usuário/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/painel do admin/i)).not.toBeInTheDocument();
    });

    it('deve redirecionar para /my-feedbacks se user (role user) estiver logado e isLoading for false', () => {
       
        const loggedInUserContext = {
            user: { id: 'u1', username: 'testuser', role: 'user' },
            isLoading: false
        };
        renderRedirectIfLoggedIn(loggedInUserContext);
       
        expect(screen.getByText(/painel do usuário/i)).toBeInTheDocument();
        expect(screen.queryByText(/página pública/i)).not.toBeInTheDocument();
    });

    it('deve redirecionar para /feedbacks se user (role adm) estiver logado e isLoading for false', () => {
   
        const loggedInAdminContext = {
            user: { id: 'a1', username: 'testadmin', role: 'adm' },
            isLoading: false
        };
        renderRedirectIfLoggedIn(loggedInAdminContext);
    
        expect(screen.getByText(/painel do admin/i)).toBeInTheDocument();
        expect(screen.queryByText(/página pública/i)).not.toBeInTheDocument();
    });

});