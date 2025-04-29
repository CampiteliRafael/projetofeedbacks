import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/button/Button';
import styles from './Header.module.css';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link to={user ? (user.role === 'adm' ? '/feedbacks' : '/') : '/login'} className={styles.logo}>
                    FeedbackApp
                </Link>

                <nav className={styles.nav}>
                    {user ? (
                    
                        <div className={styles.loggedInNav}>
                            <span className={styles.welcomeMessage}>
                                Olá, {user.username}!
                            </span>

                            {user.role === 'adm' && (
                                <Link to="/feedbacks" className={styles.navLink}>Painel Admin</Link>
                            )}
                            {user.role === 'user' && (
                                <>
                                  
                                    <Link to="/my-feedbacks" className={styles.navLink}>Meus Feedbacks</Link>
                                   
                                    <Link to="/" className={styles.navLink}>Criar Feedback</Link>
                                </>
                            )}

                            <Button
                                onClick={logout}
                                className={styles.logoutButton}
                            >
                                Sair
                            </Button>
                        </div>
                    ) : (
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