import React, { useState, useEffect, useCallback } from 'react';
import { Feedback, FeedbackStatus } from '../../../types/Feedback'; // Ajuste o caminho
import { getAllFeedbacks, updateFeedbackStatus, deleteFeedback } from '../../../api/feedbackService'; // Ajuste o caminho
import Button from '../button/Button'; // Ajuste o caminho
import styles from './FeedbackList.module.css'; // Crie este arquivo CSS Module

interface FeedbackListProps {
    refreshTrigger: number; // Prop para forçar atualização (opcional)
}

const FeedbackList: React.FC<FeedbackListProps> = ({ refreshTrigger }) => {
    console.log("FeedbackList: Componente RENDERIZOU!"); // Log inicial

    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null); // ID do feedback sendo atualizado
    const [deletingId, setDeletingId] = useState<string | null>(null); // ID do feedback sendo deletado

    // Função memoizada para buscar os feedbacks
    const loadFeedbacks = useCallback(async () => {
        console.log("FeedbackList: Buscando feedbacks...");
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAllFeedbacks(); // Usa o nome correto da função
            setFeedbacks(data);
            console.log("FeedbackList: Feedbacks carregados:", data);
        } catch (err: any) {
            console.error("FeedbackList: Erro ao buscar feedbacks:", err);
            setError(err.message || 'Falha ao carregar feedbacks.');
        } finally {
            setIsLoading(false);
        }
    }, []); // Sem dependências externas, só precisa ser definida uma vez

    // Busca inicial e quando refreshTrigger mudar
    useEffect(() => {
        loadFeedbacks();
    }, [loadFeedbacks, refreshTrigger]); // Executa quando loadFeedbacks ou refreshTrigger mudam

    // Handler para atualizar status (aprovar/rejeitar)
    const handleStatusUpdate = async (id: string, newStatus: FeedbackStatus) => {
        if (!id || updatingId || deletingId) return; // Previne cliques múltiplos
        setUpdatingId(id);
        setError(null);
        try {
            const updatedFeedback = await updateFeedbackStatus(id, newStatus);
            // Atualiza a lista localmente
            setFeedbacks(currentFeedbacks =>
                currentFeedbacks.map(fb =>
                    (fb.id === id || fb._id === id) ? { ...fb, status: updatedFeedback.status } : fb
                )
            );
             console.log(`Feedback ${id} atualizado para ${newStatus}`);
        } catch (err: any) {
            console.error(`FeedbackList: Erro ao atualizar status para ${newStatus}:`, err);
            setError(err.message || `Falha ao ${newStatus === 'aprovado' ? 'aprovar' : 'rejeitar'} feedback.`);
        } finally {
            setUpdatingId(null);
        }
    };

    // Handler para deletar
    const handleDelete = async (id: string) => {
         if (!id || updatingId || deletingId) return; // Previne cliques múltiplos
         // Confirmação visual
         if (!window.confirm('Tem certeza que deseja deletar este feedback permanentemente?')) return;

         setDeletingId(id);
         setError(null);
         try {
             await deleteFeedback(id);
             // Remove da lista localmente
             setFeedbacks(currentFeedbacks =>
                 currentFeedbacks.filter(fb => fb.id !== id && fb._id !== id)
             );
             console.log(`Feedback ${id} deletado.`);
         } catch (err: any) {
              console.error(`FeedbackList: Erro ao deletar feedback ${id}:`, err);
              setError(err.message || 'Falha ao deletar feedback.');
         } finally {
             setDeletingId(null);
         }
    };

    // --- Renderização ---
    if (isLoading) {
        return <div className={styles.message}>Carregando feedbacks...</div>;
    }

    // Mostra erro geral (pode usar FormErrorMessage se preferir)
    if (error) {
        return <div className={`${styles.message} ${styles.error}`}>Erro: {error}</div>;
    }

    if (feedbacks.length === 0) {
        return <div className={styles.message}>Nenhum feedback encontrado.</div>;
    }

    return (
        <div className={styles.feedbackListContainer}>
            <h2>Lista de Feedbacks</h2>
            <ul className={styles.feedbackList}>
                {feedbacks.map((feedback) => {
                    const currentId = feedback.id || feedback._id || ''; // Garante que temos um ID
                    const isUpdating = updatingId === currentId;
                    const isDeleting = deletingId === currentId;
                    const isDisabled = isUpdating || isDeleting; // Desabilita todos os botões do item durante ação

                    return (
                        <li key={currentId} className={styles.feedbackItem}>
                            <div className={styles.feedbackContent}>
                                <p><strong>Nome:</strong> {feedback.name}</p>
                                <p><strong>Mensagem:</strong> {feedback.message}</p>
                                <p>
                                    <strong>Status:</strong>
                                    <span className={`${styles.status} ${styles[`status${feedback.status}`]}`}>
                                        {feedback.status}
                                    </span>
                                </p>
                                <p className={styles.feedbackDate}>
                                    Recebido em: {new Date(feedback.createdAt).toLocaleString('pt-BR')}
                                </p>
                            </div>
                            <div className={styles.feedbackActions}>
                                {/* Mostra botões de Aprovar/Rejeitar apenas se status for 'pendente' */}
                                {feedback.status === 'pendente' && (
                                    <>
                                        <Button
                                            onClick={() => handleStatusUpdate(currentId, 'aprovado')}
                                            disabled={isDisabled}
                                            isLoading={isUpdating}
                                            loadingText='Aprovando...'
                                            className={styles.approveButton}
                                        >
                                            Aprovar
                                        </Button>
                                        <Button
                                            onClick={() => handleStatusUpdate(currentId, 'rejeitado')}
                                            disabled={isDisabled}
                                            isLoading={isUpdating}
                                            loadingText='Rejeitando...'
                                            className={styles.rejectButton}
                                        >
                                            Rejeitar
                                        </Button>
                                    </>
                                )}
                                {/* Botão Deletar sempre visível para admin (ou poderia ser condicional também) */}
                                <Button
                                    onClick={() => handleDelete(currentId)}
                                    disabled={isDisabled}
                                    isLoading={isDeleting}
                                    loadingText='Deletando...'
                                    className={styles.deleteButton}
                                >
                                    Deletar
                                </Button>
                            </div>
                        </li>
                    );
                 })}
            </ul>
        </div>
    );
};

export default FeedbackList;