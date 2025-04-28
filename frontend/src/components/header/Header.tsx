import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Ajuste o caminho se necessário
import Button from '../common/button/Button'; // Ajuste o caminho se necessário
import styles from './Header.module.css';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Logo/Link para Home */}
                <Link to={user ? (user.role === 'adm' ? '/feedbacks' : '/') : '/login'} className={styles.logo}>
                    FeedbackApp
                </Link>

                <nav className={styles.nav}>
                    {user ? (
                        // --- Usuário Logado ---
                        <div className={styles.loggedInNav}>
                            <span className={styles.welcomeMessage}>
                                Olá, {user.username}!
                            </span>

                            {/* ***** LINKS CONDICIONAIS POR ROLE ***** */}
                            {user.role === 'adm' && (
                                <Link to="/feedbacks" className={styles.navLink}>
                                    Listar Feedbacks {/* Opção para Admin */}
                                </Link>
                            )}
                            {user.role === 'user' && (
                                <Link to="/" className={styles.navLink}>
                                    Criar Feedback {/* Opção para User */}
                                </Link>
                            )}
                            {/* *************************************** */}

                            {/* Botão de Logout */}
                            <Button
                                onClick={logout}
                                className={styles.logoutButton}
                            >
                                Sair
                            </Button>
                        </div>
                    ) : (
                        // --- Usuário Deslogado ---
                        <div className={styles.loggedOutNav}>
                            <Link to="/login" className={styles.navLink}>
                                Login
                            </Link>
                            <Link to="/register" className={styles.navLink}>
                                Registrar
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;