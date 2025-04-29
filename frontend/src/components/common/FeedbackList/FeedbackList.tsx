import React, { useState, useEffect, useCallback } from 'react';
import { Feedback, FeedbackStatus } from '../../../types/Feedback';
import { getAllFeedbacks, updateFeedbackStatus, deleteFeedback, getFeedbackStats, FeedbackStats } from '../../../api/feedbackService';
import Button from '../button/Button';
import styles from './FeedbackList.module.css'; 

interface FeedbackListProps {
    refreshTrigger: number; 
}

const FeedbackList: React.FC<FeedbackListProps> = ({ refreshTrigger }) => {
    console.log("FeedbackList: Componente RENDERIZOU!");

    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [stats, setStats] = useState<FeedbackStats | null>(null);
    const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(true); 
    const [isLoadingStats, setIsLoadingStats] = useState(true); 
    const [error, setError] = useState<string | null>(null); 
    const [updatingId, setUpdatingId] = useState<string | null>(null); 
    const [deletingId, setDeletingId] = useState<string | null>(null);

   
    const loadFeedbacks = useCallback(async () => {
        
        try {
            const data = await getAllFeedbacks();
            setFeedbacks(data);
        } catch (err: any) {
            console.error("FeedbackList: Erro ao buscar feedbacks:", err);
            setError(err.message || 'Falha ao carregar feedbacks.');
        } finally {
             setIsLoadingFeedbacks(false);
        }
    }, []); 

    const loadStats = useCallback(async () => {
        try {
            const data = await getFeedbackStats();
            setStats(data);
        } catch (err: any) {
            console.error("FeedbackList: Erro ao buscar estatísticas:", err);
            setError(err.message || 'Falha ao carregar estatísticas.');
        } finally {
             setIsLoadingStats(false);
        }
    }, []); 

    useEffect(() => {
        console.log("FeedbackList: useEffect disparado, buscando tudo...");
        setIsLoadingFeedbacks(true); 
        setIsLoadingStats(true);
        setError(null); 

        loadFeedbacks();
        loadStats();

    }, [loadFeedbacks, loadStats, refreshTrigger]); 

    const handleStatusUpdate = async (id: string, newStatus: FeedbackStatus) => {
        if (!id || updatingId || deletingId) return; 
        setUpdatingId(id);
        setError(null);
        try {
            const updatedFeedback = await updateFeedbackStatus(id, newStatus);
            setFeedbacks(currentFeedbacks =>
                currentFeedbacks.map(fb =>
                    (fb.id === id || fb._id === id) ? { ...fb, status: updatedFeedback.status } : fb
                )
            );
            loadStats();
        } catch (err: any) {
            console.error(`FeedbackList: Erro ao atualizar status para ${newStatus}:`, err);
            setError(err.message || `Falha ao ${newStatus === 'aprovado' ? 'aprovar' : 'rejeitar'} feedback.`);
        } finally {
            setUpdatingId(null); // Libera o botão
        }
    };

    const handleDelete = async (id: string) => {
         if (!id || updatingId || deletingId) return;

         setDeletingId(id);
         setError(null);
         try {
             await deleteFeedback(id);
             setFeedbacks(currentFeedbacks =>
                 currentFeedbacks.filter(fb => fb.id !== id && fb._id !== id)
             );
            
             loadStats();
         } catch (err: any) {
              console.error(`FeedbackList: Erro ao deletar feedback ${id}:`, err);
              setError(err.message || 'Falha ao deletar feedback.');
         } finally {
             setDeletingId(null);
         }
    };

    const isOverallLoading = isLoadingFeedbacks || isLoadingStats;

    if (error && !isOverallLoading) {
        return <div className={`${styles.message} ${styles.error}`}>Erro: {error} <Button onClick={() => {loadFeedbacks(); loadStats();}} style={{marginLeft: '1rem'}}>Tentar Novamente</Button></div>;
    }

    return (
        <div className={styles.feedbackListContainer}>
            <h2>Painel de Administração</h2>

            <div className={styles.statsContainer}>
                <h3>Estatísticas</h3>
                {isLoadingStats ? (
                    <p className={styles.message}>Carregando estatísticas...</p>
                ) : stats ? (
                    <div className={styles.statsGrid}>
                        <div>Total: <span>{stats.total}</span></div>
                        <div className={styles.statPendente}>Pendente: <span>{stats.pending}</span></div>
                        <div className={styles.statAprovado}>Aprovado: <span>{stats.approved}</span></div>
                        <div className={styles.statRejeitado}>Rejeitado: <span>{stats.rejected}</span></div>
                    </div>
                ) : (
            
                    !error && <p className={styles.message}>Não foi possível carregar as estatísticas.</p>
                )}
            </div>

            <h3>Lista de Feedbacks</h3>
            {isLoadingFeedbacks ? (
                <div className={styles.message}>Carregando feedbacks...</div>
            ) : feedbacks.length === 0 ? (
                <div className={styles.message}>Nenhum feedback encontrado.</div>
            ) : (
                <ul className={styles.feedbackList}>
                    {feedbacks.map((feedback) => {
                        const currentId = feedback.id || feedback._id || '';
                        const isItemUpdating = updatingId === currentId;
                        const isItemDeleting = deletingId === currentId;
                        const isItemDisabled = isItemUpdating || isItemDeleting;

                        return (
                            <li key={currentId} className={`${styles.feedbackItem} ${isItemDisabled ? styles.itemDisabled : ''}`}>
                                <div className={styles.feedbackContent}>
                                   
                                    <p><strong>Nome Enviado:</strong> {feedback.name}</p>
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
                                    {feedback.status === 'pendente' && (
                                        <>
                                            <Button
                                                onClick={() => handleStatusUpdate(currentId, 'aprovado')}
                                                disabled={isItemDisabled} 
                                                isLoading={isItemUpdating}
                                                loadingText='Aprovando...'
                                                className={styles.approveButton}
                                            >
                                                Aprovar
                                            </Button>
                                            <Button
                                                onClick={() => handleStatusUpdate(currentId, 'rejeitado')}
                                                disabled={isItemDisabled}
                                                isLoading={isItemUpdating}
                                                loadingText='Rejeitando...'
                                                className={styles.rejectButton}
                                            >
                                                Rejeitar
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        onClick={() => handleDelete(currentId)}
                                        disabled={isItemDisabled}
                                        isLoading={isItemDeleting}
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
            )}
        </div>
    );
};

export default FeedbackList;