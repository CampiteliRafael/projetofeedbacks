import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
interface DecodedTokenPayload {
    user: {
        id: string;
        username: string;
        role: string;
    };
    iat?: number;
    exp?: number;
}
export interface AuthContextData {
    user: { id: string; username: string; role: string } | null;
    isLoading: boolean; 
    login: (token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextData>({
    user: null,
    isLoading: true,
    login: () => {},
    logout: () => {},
});

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true); 
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedTokenPayload>(token);
                if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    setUser(decoded.user);
                }
            } catch (error) {
                console.error("AuthContext: Erro ao decodificar token inicial:", error);
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setIsLoading(false); 
            }
        } else {
            setUser(null);
            setIsLoading(false); 
        }
    }, []); 

    const login = (token: string) => {
        localStorage.setItem('token', token);
        try {
            const decoded = jwtDecode<DecodedTokenPayload>(token);
             if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                 console.error("AuthContext: Tentativa de login com token expirado.");
                 logout(); 
                 return;
             }

            setUser(decoded.user);

            if (decoded.user.role === 'adm') {
                navigate('/feedbacks'); 
            } else { 
                navigate('/my-feedbacks'); 
            }
        } catch (error) {
            console.error("AuthContext: Erro ao decodificar token no login:", error);
            logout(); 
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);