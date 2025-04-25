import { Response, RequestHandler } from 'express';
import Feedback from '../models/Feedback'; 
import mongoose from 'mongoose';
import { RequestWithUser } from '../middleware/auth';

export const getAllFeedbacks = async (_req: RequestWithUser, res: Response) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);

    } catch (error: any) {
         console.error("Erro ao buscar feedbacks:", error);
         res.status(500).json({ message: 'Erro interno ao buscar feedbacks' });
    }
};

export const createFeedback = async (req: RequestWithUser, res: Response) => {
    const { name, message } = req.body;

    if (!req.user || !req.user.id) {
    res.status(401).json({ message: 'Usuário não autenticado corretamente.' });
    return;
    }

    const userId = req.user.id;

     if (!name || !message) {
        res.status(400).json({ message: 'Nome e mensagem são obrigatórios.' });
        return;
     }


    try {
        const feedback = await Feedback.create({
            name,
            message,
            userId: userId 
        });
        res.status(201).json(feedback);

    } catch (error: any) {
        console.error("Erro ao criar feedback no banco:", error);
        res.status(500).json({ message: 'Erro interno ao salvar feedback', error: error.message });
    }
};

const isValidObjectId = (id: string) => {
    return mongoose.Types.ObjectId.isValid(id);
};

export const deleteFeedback: RequestHandler = async (req: RequestWithUser, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        console.log(`ID inválido fornecido para delete: ${id}`);
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

    } catch (error: any) {
        console.error(`Erro ao deletar feedback com ID ${id}:`, error);
        res.status(500).json({ message: 'Erro interno ao deletar o feedback' });
    }
};