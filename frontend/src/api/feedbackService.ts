import { Feedback, FeedbackStatus } from "../types/Feedback"; 

const API_URL = 'http://localhost:5000/api/feedbacks';

const getAuthHeaders = (includeContentType: boolean = true): HeadersInit => {
  
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (includeContentType) { 
       headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};
export const getAllFeedbacks = async (): Promise<Feedback[]> => {
    const response = await fetch(API_URL, {
        method: 'GET', 
        headers: getAuthHeaders(), 
    });

    if (!response.ok) {
        let errorMsg = 'Erro ao buscar feedbacks';
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg; 
        } catch (e) {
            // Ignora erro ao parsear JSON se a resposta não for JSON
        }
         console.error(`Erro ${response.status}: ${errorMsg}`);
        throw new Error(errorMsg);
    }
    return response.json();
};

export const sendFeedback = async (feedbackData: { name: string, message: string }): Promise<Feedback> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(), 
        body: JSON.stringify(feedbackData),
    });

     if (!response.ok) {
        let errorMsg = 'Erro ao enviar feedback';

        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (e) {
             // Ignora erro ao parsear JSON
        }
         console.error(`Erro ${response.status}: ${errorMsg}`);
        throw new Error(errorMsg);
    }
    return response.json(); 
};

export const deleteFeedback = async (id: string): Promise<void> => {

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
     if (token) {
        headers['Authorization'] = `Bearer ${token}`;
     }

    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: headers,
    });

     if (!response.ok) {
        let errorMsg = 'Erro ao deletar feedback';

        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;

        } catch (e) {

        }
        console.error(`Erro ${response.status}: ${errorMsg}`);
        throw new Error(errorMsg);
    }
};

export const updateFeedbackStatus = async (id: string, status: FeedbackStatus): Promise<Feedback> => {
    if (!id) {
         throw new Error('ID do feedback é necessário para atualizar o status.');
    }

    const response = await fetch(`${API_URL}/${id}/status`, { 
        method: 'PATCH', 
        headers: getAuthHeaders(), 
        body: JSON.stringify({ status: status }) 
    });

    if (!response.ok) {
        let errorMsg = `Erro ao atualizar status para ${status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (e) {
             errorMsg = `Erro ${response.status}: ${response.statusText || errorMsg}`;
        }
        console.error(`API Error (${response.status}) on updateFeedbackStatus: ${errorMsg}`);
        throw new Error(errorMsg);
    }

    return response.json();
};
export interface FeedbackStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export const getFeedbackStats = async (): Promise<FeedbackStats> => {
    const response = await fetch(`${API_URL}/stats`, {
        method: 'GET',
        headers: getAuthHeaders(false), 
    });
   
    if (!response.ok) {
         let errorMsg = 'Erro ao buscar estatísticas';
         try {
             const errorData = await response.json();
             errorMsg = errorData.message || errorMsg;
         } catch (e) { errorMsg = `Erro ${response.status}: ${response.statusText || errorMsg}`; }
         console.error(`Erro ${response.status}: ${errorMsg}`);
         throw new Error(errorMsg);
    }
    return response.json();
};

export const getMyFeedbacks = async (): Promise<Feedback[]> => {
    const response = await fetch(`${API_URL}/my-feedbacks`, {
        method: 'GET',
        headers: getAuthHeaders(false), 
    });
    if (!response.ok) {
         let errorMsg = 'Erro ao buscar seus feedbacks';
         try {
             const errorData = await response.json();
             errorMsg = errorData.message || errorMsg;
         } catch (e) { errorMsg = `Erro ${response.status}: ${response.statusText || errorMsg}`; }
         console.error(`Erro ${response.status}: ${errorMsg}`);
         throw new Error(errorMsg);
    }
    return response.json();
};