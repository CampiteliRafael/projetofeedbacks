import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest'; 
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest'; 
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext';
import { jwtDecode } from 'jwt-decode';

// Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock do jwt-decode
vi.mock('jwt-decode');

// Mock do localStorage (usando spyOn no prototype)
const localStorageGetItemSpy = vi.spyOn(Storage.prototype, 'getItem');
const localStorageSetItemSpy = vi.spyOn(Storage.prototype, 'setItem');
const localStorageRemoveItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

const AuthTestConsumer = () => {
    const { user, isLoading, login, logout } = useAuth();

    if (isLoading) {
        return <div>Verificando autenticação...</div>;
    }

    return (
        <div>
            <div data-testid="user-state">{user ? `User: ${user.username} (${user.role})` : 'User: null'}</div>
            <button onClick={() => login('test-token-user')}>Login User</button>
            <button onClick={() => login('test-token-admin')}>Login Admin</button>
            <button onClick={() => login('expired-token')}>Login Expired</button>
            <button onClick={() => login('invalid-token')}>Login Invalid</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthProvider e useAuth Hook', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorageGetItemSpy.mockReturnValue(null);
        localStorageSetItemSpy.mockImplementation(() => {});
        localStorageRemoveItemSpy.mockImplementation(() => {});
        (jwtDecode as ReturnType<typeof vi.fn>).mockReset();
    });

    it('deve inicializar com isLoading=true e depois user=null se não houver token', async () => {
   
        localStorageGetItemSpy.mockReturnValueOnce(null); 

        render(
            <MemoryRouter><AuthProvider><AuthTestConsumer /></AuthProvider></MemoryRouter>
        );

        await waitFor(() => {
             expect(screen.getByTestId('user-state')).toHaveTextContent('User: null');
        });
        expect(localStorageGetItemSpy).toHaveBeenCalledWith('token');
        expect(jwtDecode).not.toHaveBeenCalled(); 
        expect(localStorageRemoveItemSpy).not.toHaveBeenCalled();
    });

    it('deve inicializar com dados do usuário se houver token válido no localStorage', async () => {
   
        const mockToken = 'valid-user-token';
        const mockUserPayloadData = { id: 'u1', username: 'validUser', role: 'user' };
        const mockDecodedPayload = { user: mockUserPayloadData, exp: Math.floor(Date.now() / 1000) + 3600 }; 
        localStorageGetItemSpy.mockReturnValueOnce(mockToken); 
        (jwtDecode as ReturnType<typeof vi.fn>).mockReturnValue(mockDecodedPayload); 

        render( <MemoryRouter><AuthProvider><AuthTestConsumer /></AuthProvider></MemoryRouter> );

        await waitFor(() => {
             expect(screen.getByTestId('user-state')).toHaveTextContent('User: validUser (user)');
        });
        expect(localStorageGetItemSpy).toHaveBeenCalledWith('token');
        expect(jwtDecode).toHaveBeenCalledWith(mockToken);
        expect(localStorageRemoveItemSpy).not.toHaveBeenCalled();
    });

     it('deve inicializar com user=null se o token no localStorage estiver expirado', async () => {
     
         const mockToken = 'expired-user-token';
         const mockDecodedPayload = { user: { id: 'u1', username: 'validUser', role: 'user' }, exp: Math.floor(Date.now() / 1000) - 3600 }; // Expirado
         localStorageGetItemSpy.mockReturnValueOnce(mockToken);
         (jwtDecode as ReturnType<typeof vi.fn>).mockReturnValue(mockDecodedPayload);

         render( <MemoryRouter><AuthProvider><AuthTestConsumer /></AuthProvider></MemoryRouter> );

         await waitFor(() => {
             expect(screen.getByTestId('user-state')).toHaveTextContent('User: null');
         });
         expect(localStorageGetItemSpy).toHaveBeenCalledWith('token');
         expect(jwtDecode).toHaveBeenCalledWith(mockToken);
         expect(localStorageRemoveItemSpy).toHaveBeenCalledWith('token'); 
    });

     it('deve inicializar com user=null se o token no localStorage for inválido (jwtDecode falha)', async () => {

        const mockToken = 'invalid-token-string';
        const decodeError = new Error("Invalid token specified");
        localStorageGetItemSpy.mockReturnValueOnce(mockToken);
        (jwtDecode as ReturnType<typeof vi.fn>).mockImplementation(() => { throw decodeError; });

        render( <MemoryRouter><AuthProvider><AuthTestConsumer /></AuthProvider></MemoryRouter> );

        await waitFor(() => {
            expect(screen.getByTestId('user-state')).toHaveTextContent('User: null');
        });
        expect(localStorageGetItemSpy).toHaveBeenCalledWith('token');
        expect(jwtDecode).toHaveBeenCalledWith(mockToken);
        expect(localStorageRemoveItemSpy).toHaveBeenCalledWith('token');
    });

    describe('Função login', () => {

         it('deve salvar token, decodificar, definir usuário e navegar para /my-feedbacks (role user)', async () => {
             const user = userEvent.setup();
             const mockToken = 'test-token-user';
             const mockDecodedUser = { user: { id: 'u2', username: 'newUser', role: 'user' }, exp: Date.now() / 1000 + 3600 };
             (jwtDecode as ReturnType<typeof vi.fn>).mockReturnValue(mockDecodedUser);

             render( <MemoryRouter><AuthProvider><AuthTestConsumer /></AuthProvider></MemoryRouter> );

             await waitFor(() => expect(screen.getByTestId('user-state')).toHaveTextContent('User: null'));
             const loginButton = screen.getByRole('button', { name: /login user/i });
             await user.click(loginButton);
             await waitFor(() => {
                 expect(localStorageSetItemSpy).toHaveBeenCalledWith('token', mockToken);
                 expect(screen.getByTestId('user-state')).toHaveTextContent('User: newUser (user)');
                 expect(mockNavigate).toHaveBeenCalledWith('/my-feedbacks');
             });
             expect(jwtDecode).toHaveBeenCalledWith(mockToken);
         });
    });

     describe('Função logout', () => {
         it('deve remover token, definir user como null e navegar para /login', async () => {
            const user = userEvent.setup(); 
            const mockToken = 'valid-user-token-for-logout';
            const mockUserPayloadData = { id: 'u1', username: 'validUser', role: 'user' };
            const mockDecodedPayload = { user: mockUserPayloadData, exp: Math.floor(Date.now() / 1000) + 3600 };

            localStorageGetItemSpy.mockReturnValueOnce(mockToken);
          
            const decodeSpy = (jwtDecode as ReturnType<typeof vi.fn>).mockReturnValue(mockDecodedPayload);
       
            render(
                <MemoryRouter initialEntries={['/']}> {/* Começa na raiz */}
                    <AuthProvider>
                        <Routes> {/* Estrutura mínima de rotas */}
                           <Route path="/" element={<AuthTestConsumer />} />
                           <Route path="/login" element={<div>Login Page after Logout</div>} />
                        </Routes>
                    </AuthProvider>
                </MemoryRouter>
            );
 
            await waitFor(() => {
               
                const userStateElement = screen.queryByTestId('user-state');
             
                expect(userStateElement).toHaveTextContent('User: validUser (user)');
            }, { timeout: 2000 }); 

            const logoutButton = screen.getByRole('button', { name: /logout/i });
        
            await user.click(logoutButton);
    
            await waitFor(() => {
             
                expect(localStorageRemoveItemSpy).toHaveBeenCalledWith('token');
                expect(screen.getByTestId('user-state')).toHaveTextContent('User: null');
                expect(mockNavigate).toHaveBeenCalledWith('/login');
            });
           
             expect(localStorageGetItemSpy).toHaveBeenCalledWith('token');
             expect(decodeSpy).toHaveBeenCalledTimes(1);
             expect(decodeSpy).toHaveBeenCalledWith(mockToken);
             console.log('LOGOUT_TEST: Teste concluído.');
         });
     }); 

});