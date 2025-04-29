import mongoose, { Schema, Document, Types } from 'mongoose';

type FeedbackStatus = 'pendente' | 'aprovado' | 'rejeitado';
export interface IFeedback extends Document {
    name: string;
    message: string;
    userId: Types.ObjectId;
    status: FeedbackStatus; 
    createdAt: Date;
    updatedAt: Date; 
}

const feedbackSchema = new Schema<IFeedback>({
    name: { type: String, required: true },
    message: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    status: {
        type: String,
        enum: ['pendente', 'aprovado', 'rejeitado'], 
        default: 'pendente' 
    },
}, { timestamps: true }); 

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);