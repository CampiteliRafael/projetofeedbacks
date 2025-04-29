import React, { useState } from 'react';
import InputField from '../InputField/InputField';
import Button from '../button/Button';
import FormErrorMessage from '../FormErrorMessage/FormErrorMessage'; 
import { sendFeedback } from '../../../api/feedbackService';
import { useAuth } from '../../../context/AuthContext';
import styles from './FeedbackForm.module.css';
interface Props {
    onSent: () => void;
}

export default function FeedbackForm({ onSent }: Props) {
  
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const userName = user?.username || 'Usuário Anônimo';
        const feedbackData = { name: userName, message: message }; 

        try {

            await sendFeedback(feedbackData);
            setMessage(''); 
            onSent(); 

        } catch (err: any) {
            console.error("Erro capturado no formulário ao enviar feedback:", err);
            setError(err.message || 'Falha ao enviar feedback.'); 
        } finally {
            setIsSubmitting(false); 
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.feedbackForm} >
            <h2>Enviar Feedback</h2>

            <InputField
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

            <FormErrorMessage>{error}</FormErrorMessage>

            <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                loadingText="Enviando..."
            >
                Enviar
            </Button>
        </form>
    );
}