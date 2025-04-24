import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface AuthContextData {
    user: { id: string; username: string; role: string } | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextData>({
    user: null,
    login: () => {},
    logout: () => {},
});

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: { user: { id: string; username: string; role: string } } = jwtDecode(token);
                return decoded.user;
            } catch (error) {
                localStorage.removeItem('token');
                return null;
            }
        }
        return null;
    });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: { user: { id: string; username: string; role: string } } = jwtDecode(token);
                setUser(decoded.user);
            } catch (error) {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        try {
            const decoded: { user: { id: string; username: string; role: string } } = jwtDecode(token);
            setUser(decoded.user);
            navigate('/');
        } catch (error) {
            console.error("Erro ao decodificar token:", error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);