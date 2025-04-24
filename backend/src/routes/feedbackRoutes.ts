import { Router } from "express";
import { getAllFeedbacks, createFeedback, deleteFeedback } from "../controllers/feedbackController";
import { auth } from '../middleware/auth'; // Importe o middleware de autenticação

const router = Router();

// Somente ADMs podem obter todos os feedbacks
router.get('/', auth('adm'), getAllFeedbacks);

// Todos os usuários autenticados podem criar feedbacks
router.post('/', auth(), createFeedback);

// Somente ADMs podem deletar feedbacks
router.delete('/:id', auth('adm'), deleteFeedback);

export default router;