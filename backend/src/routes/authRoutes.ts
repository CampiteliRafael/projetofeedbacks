import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController';

const router = Router();

router.post(
    '/register',
    [
        body('username', 'Nome de usuário é obrigatório').notEmpty(),
        body('password', 'Senha é obrigatória').isLength({ min: 6 }),
    ],
    register 
);

router.post(
    '/login',
    [
        body('username', 'Nome de usuário é obrigatório').notEmpty(),
        body('password', 'Senha é obrigatória').notEmpty(),
    ],
    login 
);

export default router;