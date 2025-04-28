// Exemplo: src/types/Feedback.ts (ou onde estiver sua definição)


// Defina os possíveis status aqui também para consistência
export type FeedbackStatus = 'pendente' | 'aprovado' | 'rejeitado';

export interface Feedback {
    // Mantenha os campos existentes
    _id?: string; // ID geralmente é string no frontend após JSON.parse
    id?: string; // Pode usar id ou _id
    name: string;
    message: string;
    userId: string // Mantenha como estava ou use string
    createdAt: string | Date; // Pode vir como string da API
    updatedAt?: string | Date;

    // --- ADICIONE O STATUS ---
    status: FeedbackStatus;
    // -------------------------
}