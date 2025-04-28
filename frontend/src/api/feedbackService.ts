import { Feedback, FeedbackStatus } from "../types/Feedback"; 

const API_URL = 'http://localhost:5000/api/feedbacks';

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = { 
        'Content-Type': 'application/json', 
    };
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
    // Verifica se o ID foi fornecido
    if (!id) {
         throw new Error('ID do feedback é necessário para atualizar o status.');
    }
     // Verifica se o status é válido (opcional, backend também valida)
    // const allowedStatuses: FeedbackStatus[] = ['aprovado', 'rejeitado'];
    // if (!allowedStatuses.includes(status)) {
    //      throw new Error(`Status inválido: ${status}`);
    // }


    console.log(`Chamando API para atualizar status: ID=<span class="math-inline">\{id\}, Status\=</span>{status}`); // Log para debug

    const response = await fetch(`${API_URL}/${id}/status`, { // Chama o novo endpoint
        method: 'PATCH', // Usa o método PATCH
        headers: getAuthHeaders(), // Envia token de admin e Content-Type
        body: JSON.stringify({ status: status }) // Envia o novo status no corpo
    });

    // Tratamento de erro
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

    // Retorna o feedback atualizado enviado pelo backend
    return response.json();
};