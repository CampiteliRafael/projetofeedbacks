import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import InputField from '../../components/common/InputField/InputField'
import Button from '../../components/common/button/Button';
import FormErrorMessage from '../../components/common/FormErrorMessage/FormErrorMessage';
import styles from '../Login/Login.module.css'

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json().catch(() => {
                return { message: `Erro ${response.status}: ${response.statusText}` };
            });

            if (response.ok && data.token) {
                login(data.token);
            } else {
                setError(data.message || `Erro ${response.status} ao fazer login`);
            }
        } catch (err: any) {
            console.error("Erro de rede ou fetch ao fazer login:", err);
            let errorMessage = 'Ocorreu um erro inesperado ao tentar fazer login.';
            if (err instanceof TypeError && err.message === 'Failed to fetch') {
                errorMessage = 'Não foi possível conectar ao servidor. Verifique a conexão ou se o servidor está rodando.';
            }
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.login}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <InputField
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Nome de usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <div>
                    <InputField
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                    />
                </div>
                {error && (
                    <FormErrorMessage>{error}</FormErrorMessage>
                )}

                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    loadingText="Entrando..."
                    className={styles.button}
                >
                    Login
                </Button>
            </form>
            <p>
                Não tem uma conta? <Link to="/register">Registre-se</Link>
            </p>
        </div>
    );
};

export default Login;