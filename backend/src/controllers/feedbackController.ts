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

export const updateFeedbackStatus: RequestHandler = async (req: RequestWithUser, res: Response): Promise<void> => {
    console.log(`\n--- Controller updateFeedbackStatus ---`); // <-- LOG AQUI
    console.log(`Recebida requisição para ID: ${req.params.id} com Status: ${req.body.status}`);
    const { id } = req.params; // Pega o ID do feedback da URL
    const { status } = req.body; // Pega o novo status do corpo da requisição

    // 1. Valida o ID
    if (!isValidObjectId(id)) {
        res.status(400).json({ message: 'ID de feedback inválido' });
        return;
    }

    // 2. Valida o novo status recebido
    const allowedStatuses = ['aprovado', 'rejeitado'];
    if (!status || !allowedStatuses.includes(status)) {
        res.status(400).json({ message: `Status inválido. Status permitidos: ${allowedStatuses.join(', ')}` });
        return;
    }

    try {
        // 3. Encontra e atualiza o feedback
        const updatedFeedback = await Feedback.findByIdAndUpdate(
            id, // ID do documento a ser atualizado
            { status: status }, // Objeto com os campos a serem atualizados
            { new: true, runValidators: true } // Opções: new=true retorna o doc atualizado, runValidators=true garante que o enum seja verificado
        );

        // 4. Verifica se o feedback foi encontrado
        if (!updatedFeedback) {
            res.status(404).json({ message: 'Feedback não encontrado' });
            return;
        }

        // 5. Retorna o feedback atualizado
        res.status(200).json(updatedFeedback);

    } catch (error: any) {
        console.error(`Erro ao atualizar status do feedback ${id} para ${status}:`, error);
        res.status(500).json({ message: 'Erro interno ao atualizar status do feedback' });
    }
};

// Função para buscar estatísticas (Admin)
export const getFeedbackStats: RequestHandler = async (_req: RequestWithUser, res: Response): Promise<void> => {
    console.log("BACKEND: getFeedbackStats - Controller INICIOU");
    try {
        const total = await Feedback.countDocuments();
        const pending = await Feedback.countDocuments({ status: 'pendente' });
        const approved = await Feedback.countDocuments({ status: 'aprovado' });
        const rejected = await Feedback.countDocuments({ status: 'rejeitado' });

        console.log("BACKEND: getFeedbackStats - Stats calculadas");
        res.status(200).json({ total, pending, approved, rejected });
         console.log("BACKEND: getFeedbackStats - Resposta enviada");
    } catch (error: any) {
        console.error("BACKEND: getFeedbackStats - ERRO no CATCH:", error);
        res.status(500).json({ message: "Erro ao buscar estatísticas de feedback." });
    }
};

// Função para buscar feedbacks do usuário logado (User)
export const getMyFeedbacks: RequestHandler = async (req: RequestWithUser, res: Response): Promise<void> => {
    console.log("BACKEND: getMyFeedbacks - Controller INICIOU");
    if (!req.user || !req.user.id) {
        console.log("BACKEND: getMyFeedbacks - Falha: Usuário não autenticado.");
        res.status(401).json({ message: 'Usuário não autenticado corretamente.' });
        return;
    }
    const userId = req.user.id;
    console.log(`BACKEND: getMyFeedbacks - Buscando para userId: ${userId}`);
    try {
        const feedbacks = await Feedback.find({ userId: userId }).sort({ createdAt: -1 });
        console.log("BACKEND: getMyFeedbacks - Feedbacks encontrados:", feedbacks?.length);
        res.status(200).json(feedbacks);
         console.log("BACKEND: getMyFeedbacks - Resposta enviada");
    } catch (error: any) {
        console.error(`BACKEND: getMyFeedbacks - ERRO no CATCH para userId ${userId}:`, error);
        res.status(500).json({ message: "Erro ao buscar seus feedbacks." });
    }
};