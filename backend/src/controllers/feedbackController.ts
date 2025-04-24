import { Request, Response, RequestHandler } from 'express';
import Feedback from '../models/Feedback';
import mongoose from 'mongoose';

export const getAllFeedbacks = async (_req: Request, res: Response) => {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
};

export const createFeedback = async (req: Request, res: Response) => {
    const { name, message } = req.body;
    const feedback = await Feedback.create({ name, message });
    res.status(201).json(feedback);
};

const isValidObjectId = (id: string) => {
    return mongoose.Types.ObjectId.isValid(id);
};

export const deleteFeedback: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        console.log(`ID inválido: ${id}`);
        res.status(400).json({ message: 'ID inválido' });
        return;
    }

    try {
        const deletedFeedback = await Feedback.findByIdAndDelete(id);

        if (!deletedFeedback) {
            res.status(404).json({ message: 'Feedback não encontrado' });
            return;
        }
        res.status(200).json({ message: 'Feedback deletado com sucesso' });
        return;
    } catch (error) {
        console.error(`Erro ao deletar feedback com ID: ${id}`, error);
        res.status(500).json({ message: 'Erro ao deletar o feedback', error });
        return;
    }
};