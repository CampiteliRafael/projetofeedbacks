import { Feedback } from "../types/Feedback";

const API_URL = 'http://localhost:5000/api/feedbacks';

export const getAllFeedbacks = async (): Promise<Feedback[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error ('Error ao buscar feedbacks');
    return response.json();
};

export const sendFeedback = async (feedback: Feedback): Promise<Feedback> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
    });

    if (!response.ok) throw new Error('Erro ao enviar feedback');
    return response.json();
}

export const deleteFeedback = async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE', });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar feedback');
    }
};
