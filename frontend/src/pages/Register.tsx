import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../components/common/InputField/InputField'; 
import Button from '../components/common/button/Button';   
import FormErrorMessage from '../components/common/FormErrorMessage/FormErrorMessage'; 
import styles from './Register/Register.module.css'

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true); 

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}` }));

            if (response.ok) {

                 alert('Registro bem-sucedido! Faça login agora.'); // Manter alert aqui ou substituir por mensagem inline
                 navigate('/login'); 

            } else {
                setError(data.message || `Erro ${response.status} ao registrar`);
            }
        } catch (err: any) {
            console.error("Erro de rede ou fetch ao registrar:", err);
             let errorMessage = 'Ocorreu um erro inesperado ao tentar registrar.';
             if (err instanceof TypeError && err.message === 'Failed to fetch') {
                 errorMessage = 'Não foi possível conectar ao servidor. Verifique a conexão ou se o servidor está rodando.';
             }
            setError(errorMessage);
        } finally {
            setIsSubmitting(false); 
        }
    };

    return (
        <div className={styles.register}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <InputField
                    type="text"
                    id="usernameReg" 
                    name="username"
                    placeholder="Nome de usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isSubmitting} 
                />
                <InputField
                    type="password"
                    id="passwordReg" 
                    name="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting} 
                />

                 {error && (
                     <FormErrorMessage>{error}</FormErrorMessage>
                )}

                <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    loadingText="Registrando..."
                    className={styles.button}
                >
                    Registrar
                </Button>
            </form>
            <p>
                Já tem uma conta? <Link to="/login">Faça login</Link>
            </p>
        </div>
    );
};

export default Register;