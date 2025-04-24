// src/routes/authRoutes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController'; // Importe as funções do controller

const router = Router();

// Rota de Registro
router.post(
    '/register',
    [
        body('username', 'Nome de usuário é obrigatório').notEmpty(),
        body('password', 'Senha é obrigatória').isLength({ min: 6 }),
    ],
    register // Use a função do controller
);

// Rota de Login
router.post(
    '/login',
    [
        body('username', 'Nome de usuário é obrigatório').notEmpty(),
        body('password', 'Senha é obrigatória').notEmpty(),
    ],
    login // Use a função do controller
);

export default router;