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

    if (req.user.role === 'adm') {
        return res.status(403).json({ message: 'Administradores não podem criar feedbacks por esta rota.' });
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

export const updateFeedbackStatus: RequestHandler = async (req: RequestWithUser, res: Response): Promise<void> => {
    const { id } = req.params; 
    const { status } = req.body; 

    // 1. Valida o ID
    if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'ID de feedback inválido' });
        return;
    }

    const allowedStatuses = ['aprovado', 'rejeitado'];
    if (!status || !allowedStatuses.includes(status)) {
        res.status(400).json({ message: `Status inválido. Status permitidos: ${allowedStatuses.join(', ')}` });
        return;
    }

    try {
        const updatedFeedback = await Feedback.findByIdAndUpdate(
            id, 
            { status: status }, 
            { new: true, runValidators: true } 
        );

        if (!updatedFeedback) {
            res.status(404).json({ message: 'Feedback não encontrado' });
            return;
        }

        res.status(200).json(updatedFeedback);

    } catch (error: any) {
        console.error(`Erro ao atualizar status do feedback ${id} para ${status}:`, error);
        res.status(500).json({ message: 'Erro interno ao atualizar status do feedback' });
    }
};

export const getFeedbackStats: RequestHandler = async (_req: RequestWithUser, res: Response): Promise<void> => {
    try {
        const total = await Feedback.countDocuments();
        const pending = await Feedback.countDocuments({ status: 'pendente' });
        const approved = await Feedback.countDocuments({ status: 'aprovado' });
        const rejected = await Feedback.countDocuments({ status: 'rejeitado' });

        res.status(200).json({ total, pending, approved, rejected });
    } catch (error: any) {
        console.error("BACKEND: getFeedbackStats - ERRO no CATCH:", error);
        res.status(500).json({ message: "Erro ao buscar estatísticas de feedback." });
    }
};

export const getMyFeedbacks: RequestHandler = async (req: RequestWithUser, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Usuário não autenticado corretamente.' });
        return;
    }
    const userId = req.user.id;
    try {
        const feedbacks = await Feedback.find({ userId: userId }).sort({ createdAt: -1 });
        res.status(200).json(feedbacks);
    } catch (error: any) {
        console.error(`BACKEND: getMyFeedbacks - ERRO no CATCH para userId ${userId}:`, error);
        res.status(500).json({ message: "Erro ao buscar seus feedbacks." });
    }
};