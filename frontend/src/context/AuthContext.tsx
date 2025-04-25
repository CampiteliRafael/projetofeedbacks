import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Interface para o payload do token (ajuste se necessário)
interface DecodedTokenPayload {
    user: {
        id: string;
        username: string;
        role: string;
    };
    iat?: number;
    exp?: number;
}

// Interface para os dados do contexto
interface AuthContextData {
    user: { id: string; username: string; role: string } | null;
    isLoading: boolean; // <-- NOVO: Estado de loading adicionado
    login: (token: string) => void;
    logout: () => void;
}

// Criação do contexto com valor inicial
const AuthContext = createContext<AuthContextData>({
    user: null,
    isLoading: true, // <-- NOVO: Inicia como true
    login: () => {},
    logout: () => {},
});

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // Estado para o usuário
    const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null);
    // NOVO: Estado para controlar o carregamento inicial da autenticação
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // useEffect para verificar o token na montagem inicial do componente
    useEffect(() => {
        // console.log("AuthContext: Verificando token inicial..."); // Log opcional
        setIsLoading(true); // Começa a verificação
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedTokenPayload>(token);
                // Verifica se o token expirou
                if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                    // console.log("AuthContext: Token inicial expirado."); // Log opcional
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    // console.log("AuthContext: Token inicial válido, definindo usuário."); // Log opcional
                    setUser(decoded.user);
                }
            } catch (error) {
                console.error("AuthContext: Erro ao decodificar token inicial:", error);
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                // console.log("AuthContext: Verificação inicial concluída."); // Log opcional
                setIsLoading(false); // <-- Terminou de carregar, independentemente do resultado
            }
        } else {
            // console.log("AuthContext: Nenhum token inicial encontrado."); // Log opcional
            setUser(null);
            setIsLoading(false); // <-- Terminou de carregar (sem usuário)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Roda apenas uma vez

    // Função de login
    const login = (token: string) => {
        localStorage.setItem('token', token);
        try {
            const decoded = jwtDecode<DecodedTokenPayload>(token);
            // Verifica expiração antes de prosseguir
             if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                 console.error("AuthContext: Tentativa de login com token expirado.");
                 logout(); // Chama logout para limpar tudo e redirecionar
                 return;
             }

            setUser(decoded.user);
            // O setIsLoading(false) não é estritamente necessário aqui,
            // pois o estado já deve ser false do useEffect inicial,
            // e a atualização de 'user' já causa re-renderização.

            console.log('AuthContext DEBUG: Role decodificada do token:', decoded.user.role); // Manter para debug

            if (decoded.user.role === 'adm') {
                console.log('AuthContext: Redirecionando para /feedbacks (admin)');
                navigate('/feedbacks');
            } else {
                console.log('AuthContext: Redirecionando para / (user)');
                navigate('/');
            }
        } catch (error) {
            console.error("AuthContext: Erro ao decodificar token no login:", error);
            logout(); // Chama logout em caso de erro na decodificação
        }
    };

    // Função de logout
    const logout = () => {
        // console.log("AuthContext: Efetuando logout."); // Log opcional
        localStorage.removeItem('token');
        setUser(null);
        // setIsLoading(false); // Garante que não está carregando após logout
        navigate('/login');
    };

    // Retorna o provedor com o valor atualizado (incluindo isLoading)
    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook para usar o contexto
export const useAuth = () => useContext(AuthContext);