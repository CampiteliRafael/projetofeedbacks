import { Request, Response, RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User';


export const register: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            res.status(400).json({ message: 'Usuário já existe' });
            return;
        }

        user = new User({ username, password });
        await user.save();

        const payload = { user: { id: user.id, role: user.role } };

        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) {
                console.error("Erro ao gerar token:", err);
                res.status(500).json({ message: 'Erro interno ao gerar token' });
            } else {
                res.json({ token });
            }
        });

    } catch (err: any) {
        console.error("Erro no registro:", err.message);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Erro no servidor durante o registro' });
        }
    }
};

export const login: RequestHandler = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            res.status(400).json({ message: 'Credenciais inválidas (usuário)' });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(400).json({ message: 'Credenciais inválidas (senha)' });
            return;
        }

        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) {
                console.error("Erro ao gerar token no login:", err);
                res.status(500).json({ message: 'Erro interno ao gerar token' });
            } else {
                res.json({ token });
            }
        });

    } catch (err: any) {
        console.error("Erro no login:", err.message);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Erro no servidor durante o login' });
        }
    }
};