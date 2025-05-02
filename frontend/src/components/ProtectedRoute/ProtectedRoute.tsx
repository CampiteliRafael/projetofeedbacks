import React from 'react';
import { Navigate, useLocation } from 'react-router-dom'; // Importe useLocation
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation(); 

    if (isLoading) {
        return <div>Verificando autenticação...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" replace />; 
    }

    return <>{children}</>;
};

export default ProtectedRoute;