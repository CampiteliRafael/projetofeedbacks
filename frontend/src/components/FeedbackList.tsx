import { useEffect, useState } from "react";
import { getAllFeedbacks, deleteFeedback } from "../api/feedbackService";
import { Feedback } from "../types/Feedback";

interface Props {
    refreshTrigger: number;
}

export default function FeedbackList({ refreshTrigger }: Props) {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    useEffect(() => {
        getAllFeedbacks().then(setFeedbacks).catch((err) => console.error(err));
    }, [refreshTrigger]);

const handleDelete = async (id: string) => {
    try {
        await deleteFeedback(id);
        setFeedbacks(feedbacks.filter(f => f._id !== id));
        alert('Feedback deletado com sucesso!');
    } catch (error: any) {
        console.error("Erro ao deletar feedback:", error);
        alert(`Erro ao deletar feedback: ${error.message}`);
    }
}

    return (
        <div>
            <h2>Feedbacks</h2>
            <ul>
                {feedbacks.map((f) => (
                    <li key={f._id} className="feedback-item">
                    <div className="feedback-text">
                      <strong>{f.name}</strong>: {f.message}
                    </div>
                    <button className="delete-button" onClick={() => handleDelete(f._id!)}>Excluir</button>
                  </li>
                ))}
            </ul>
        </div>
    );
}
