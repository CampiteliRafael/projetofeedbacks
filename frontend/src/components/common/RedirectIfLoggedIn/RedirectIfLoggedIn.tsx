import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; 

interface RedirectIfLoggedInProps {
  children: React.ReactNode; 
}

const RedirectIfLoggedIn: React.FC<RedirectIfLoggedInProps> = ({ children }) => {
    const { user, isLoading } = useAuth();
  
    if (isLoading) {
      return <div>Carregando...</div>;
    }
  
    if (user) {
      const targetPath = user.role === 'adm' ? '/feedbacks' : '/my-feedbacks';
      return <Navigate to={targetPath} replace />;
    }
  
    return <>{children}</>;
  };
  
  export default RedirectIfLoggedIn;