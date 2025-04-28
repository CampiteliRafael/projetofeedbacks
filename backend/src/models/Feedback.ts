import mongoose, { Schema, Document, Types } from 'mongoose';

// Defina os possíveis status
type FeedbackStatus = 'pendente' | 'aprovado' | 'rejeitado';

export interface IFeedback extends Document {
    name: string;
    message: string;
    userId: Types.ObjectId;
    status: FeedbackStatus; // <-- NOVO: Campo de status
    createdAt: Date;
    updatedAt: Date; // Timestamps: true adiciona ambos
}

const feedbackSchema = new Schema<IFeedback>({
    name: { type: String, required: true },
    message: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // --- NOVO CAMPO STATUS ---
    status: {
        type: String,
        enum: ['pendente', 'aprovado', 'rejeitado'], // Valores permitidos
        default: 'pendente' // Valor inicial padrão
    },
    // -------------------------
}, { timestamps: true }); 

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);