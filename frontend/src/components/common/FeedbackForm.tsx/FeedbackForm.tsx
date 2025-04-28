import React, { useState } from 'react';
// Ajuste os caminhos dos imports conforme sua estrutura de pastas real!
import InputField from '../InputField/InputField';
import Button from '../button/Button';
import FormErrorMessage from '../FormErrorMessage/FormErrorMessage'; // <-- 1. Importe o componente de erro
import { sendFeedback } from '../../../api/feedbackService';
import { useAuth } from '../../../context/AuthContext'; // <-- 2. Importe a função do serviço API
import styles from './FeedbackForm.module.css';

interface Props {
    onSent: () => void;
}

export default function FeedbackForm({ onSent }: Props) {
    // O estado 'name' foi removido. Se precisar dele de volta, descomente:
    // const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    // Se precisar do nome do usuário logado (talvez para preencher 'name' automaticamente):
    // import { useAuth } from '../context/AuthContext'; // Ajuste o caminho
    // const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        console.log('DEBUG: Objeto User dentro de handleSubmit:', user);

        // Prepara os dados a serem enviados.
        // Se precisar enviar o nome: const feedbackData = { name: user?.username || 'Anônimo', message };
        const userName = user?.username || 'Usuário Anônimo';
        const feedbackData = { name: userName, message: message }; // Enviando apenas a mensagem

        try {
            // --- 3. SUBSTITUA A SIMULAÇÃO PELA CHAMADA REAL ---
            // Remove estas linhas:
            // await new Promise(resolve => setTimeout(resolve, 1000));
            // console.log('Feedback enviado (simulado):', { message });

            // Adiciona esta linha:
            await sendFeedback(feedbackData);
            // --------------------------------------------------

            console.log('Feedback enviado com sucesso para a API!');
            setMessage(''); // Limpa o campo
            onSent(); // Chama a função do pai (ex: para atualizar a lista)

        } catch (err: any) {
            // O erro 'err' aqui virá do 'throw new Error(errorMsg)' dentro do sendFeedback
            console.error("Erro capturado no formulário ao enviar feedback:", err);
            setError(err.message || 'Falha ao enviar feedback.'); // Mostra o erro para o usuário
        } finally {
            setIsSubmitting(false); // Reativa o botão
        }
    };

    return (
        // Considere adicionar um 'className' do CSS Module se quiser estilizar o form
        <form onSubmit={handleSubmit} className={styles.feedbackForm} >
            <h2>Enviar Feedback</h2>

            {/* InputField para Nome REMOVIDO - Adicione de volta se necessário */}

            <InputField
                // label="Mensagem" // Label é opcional
                as="textarea"
                id="feedbackMessage"
                name="feedbackMessage"
                rows={5}
                placeholder="Digite sua mensagem aqui..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={isSubmitting}
            />

            {/* 4. Adiciona o componente para mostrar erros */}
            <FormErrorMessage>{error}</FormErrorMessage>

            <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                loadingText="Enviando..."
                // className={styles.submitButton} // Pode adicionar classe específica
            >
                Enviar
            </Button>
        </form>
    );
}