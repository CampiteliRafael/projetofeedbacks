import { Router } from "express";
// 1. Importe a nova função do controller
import {
    getAllFeedbacks,
    createFeedback,
    deleteFeedback,
    updateFeedbackStatus // <-- IMPORTAR
} from "../controllers/feedbackController";

// Ajuste o caminho se seu middleware estiver em pasta diferente
import { auth } from '../middleware/auth';

const router = Router();

// --- Rotas Existentes ---
// GET / : Somente ADMs podem obter todos os feedbacks
router.get('/', auth('adm'), getAllFeedbacks);

// POST / : Todos os usuários autenticados podem criar feedbacks (se não forem 'adm')
router.post('/', auth(), createFeedback); // Middleware auth() já protege

// DELETE /:id : Somente ADMs podem deletar feedbacks
router.delete('/:id', auth('adm'), deleteFeedback);


// --- NOVA ROTA ---
// PATCH /:id/status : Somente ADMs podem atualizar o status
router.patch('/:id/status', auth('adm'), updateFeedbackStatus); // <-- ADICIONAR ROTA
// Usamos PATCH porque é uma atualização parcial do recurso


export default router;