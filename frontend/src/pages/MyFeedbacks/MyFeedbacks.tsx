import React, { useState, useEffect, useCallback } from 'react';
import { Feedback } from '../../types/Feedback';
import { getMyFeedbacks } from '../../api/feedbackService'; 
import styles from './MyFeedbacks.module.css'; 

const MyFeedbacks: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMyFeedbacks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getMyFeedbacks();
            setFeedbacks(data);
        } catch (err: any) {
            console.error("Erro ao buscar meus feedbacks:", err);
            setError(err.message || 'Falha ao carregar seus feedbacks.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMyFeedbacks();
    }, [loadMyFeedbacks]);

    if (isLoading) {
        return <div className={styles.message}>Carregando seus feedbacks...</div>;
    }

    if (error) {
        return <div className={`${styles.message} ${styles.error}`}>Erro: {error}</div>;
    }

    return (
        <div className={styles.myFeedbacksContainer}>
            <h2>Meus Feedbacks Enviados</h2>

            {feedbacks.length === 0 ? (
                <div className={styles.message}>Você ainda não enviou nenhum feedback.</div>
            ) : (
                <ul className={styles.feedbackList}>
                    {feedbacks.map((feedback) => (
                        <li key={feedback.id || feedback._id} className={styles.feedbackItem}>
                            <p><strong>Mensagem:</strong> {feedback.message}</p>
                            <p>
                                <strong>Status:</strong>
                                <span className={`${styles.status} ${styles[`status${feedback.status}`]}`}>
                                    {feedback.status}
                                </span>
                            </p>
                            <p className={styles.feedbackDate}>
                                Enviado em: {new Date(feedback.createdAt).toLocaleString('pt-BR')}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyFeedbacks;