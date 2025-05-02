import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

import { AuthContext } from '../../../context/AuthContext';
import ProtectedRoute from '../ProtectedRoute';
import { vi } from 'vitest';

const MockProtectedPage = () => <div>Conteúdo Protegido</div>;
const MockLoginPage = () => <div>Página de Login Visível</div>;
const MockHomePage = () => <div>Página Inicial Visível</div>; 

describe('Componente ProtectedRoute', () => {
   
    const mockLogin = vi.fn();
    const mockLogout = vi.fn();

    const renderProtectedRoute = (
        contextValue: { 
            user: { id: string; role: string; username: string } | null;
            isLoading: boolean;
            login: () => void;
            logout: () => void;
        },
        routeProps: { 
            requiredRole?: string;
            initialEntry?: string[]; 
        } = {}
    ) => {
        const { requiredRole, initialEntry = ['/protegido'] } = routeProps; 

        return render(
            <AuthContext.Provider value={contextValue}>
                <MemoryRouter initialEntries={initialEntry}>
                    <Routes>
                        {/* Rota de Login (para onde deve redirecionar se não logado) */}
                        <Route path="/login" element={<MockLoginPage />} />

                        {/* Rota Protegida que estamos testando */}
                        <Route
                            path="/protegido"
                            element={
                                <ProtectedRoute requiredRole={requiredRole}>
                                    <MockProtectedPage />
                                </ProtectedRoute>
                            }
                        />

                         {/* Rota Inicial (para onde deve redirecionar se role errada) */}
                         <Route path="/" element={<MockHomePage />} />

                    </Routes>
                </MemoryRouter>
            </AuthContext.Provider>
        );
    };

    it('deve mostrar mensagem de carregamento se isLoading for true', () => {
      
        const loadingContext = { user: null, isLoading: true, login: mockLogin, logout: mockLogout };

        renderProtectedRoute(loadingContext);

        expect(screen.getByText(/verificando autenticação/i)).toBeInTheDocument();
        expect(screen.queryByText(/conteúdo protegido/i)).not.toBeInTheDocument();
    });

    it('deve redirecionar para /login se isLoading for false e user for null', () => {
      
        const loggedOutContext = { user: null, isLoading: false, login: mockLogin, logout: mockLogout };

        renderProtectedRoute(loggedOutContext);

        expect(screen.getByText(/página de login visível/i)).toBeInTheDocument();
        expect(screen.queryByText(/conteúdo protegido/i)).not.toBeInTheDocument();
    });

    it('deve renderizar children se isLoading for false, user existir e não houver requiredRole', () => {
        
        const loggedInUserContext = {
            user: { id: 'u1', username: 'testuser', role: 'user' },
            isLoading: false,
            login: mockLogin,
            logout: mockLogout
        };

        renderProtectedRoute(loggedInUserContext);

        expect(screen.getByText(/conteúdo protegido/i)).toBeInTheDocument();
        expect(screen.queryByText(/página de login visível/i)).not.toBeInTheDocument();
    });

     it('deve renderizar children se user existir e a role corresponder a requiredRole', () => {
        
        const loggedInAdminContext = {
            user: { id: 'a1', username: 'testadmin', role: 'adm' },
            isLoading: false,
            login: mockLogin,
            logout: mockLogout
        };

        renderProtectedRoute(loggedInAdminContext, { requiredRole: 'adm' });

        expect(screen.getByText(/conteúdo protegido/i)).toBeInTheDocument();
     });

     it('deve redirecionar para / (ou outra rota) se user existir mas a role NÃO corresponder a requiredRole', () => {
    
        const loggedInUserContext = {
            user: { id: 'u1', username: 'testuser', role: 'user' },
            isLoading: false,
            login: mockLogin,
            logout: mockLogout
        };

        renderProtectedRoute(loggedInUserContext, { requiredRole: 'adm' });

        expect(screen.getByText(/página inicial visível/i)).toBeInTheDocument();
        expect(screen.queryByText(/conteúdo protegido/i)).not.toBeInTheDocument();
     });

});