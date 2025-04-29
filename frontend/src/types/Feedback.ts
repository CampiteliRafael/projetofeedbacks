export type FeedbackStatus = 'pendente' | 'aprovado' | 'rejeitado';
export interface Feedback {
    _id?: string; 
    id?: string; 
    name: string;
    message: string;
    userId: string 
    createdAt: string | Date; 
    updatedAt?: string | Date;
    status: FeedbackStatus;
}