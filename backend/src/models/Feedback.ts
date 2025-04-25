// Exemplo de src/models/Feedback.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFeedback extends Document {
    name: string;
    message: string;
    userId: Types.ObjectId; // Campo para associar ao usuário
    createdAt: Date;
    // updatedAt: Date; // se precisar
}

const feedbackSchema = new Schema<IFeedback>({
    name: { type: String, required: true },
    message: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Referência ao modelo User
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);