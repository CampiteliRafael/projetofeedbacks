import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
    user: {
        id: string;
        role: string;
    };
}

export const auth = (requiredRole?: string) => (req: Request, res: Response, next: NextFunction) => {
    // Obter o token do header
    const token = req.header('x-auth-token');

    // Verificar se não existe token
    if (!token) {
     res.status(401).json({ message: 'Sem token, autorização negada' });
     return;
    }

    // Verificar token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as UserPayload;

        // Adicionar informações do usuário ao objeto de requisição
        (req as any).user = decoded.user;

        // Verificar se a role do usuário corresponde à role necessária (se houver)
        if (requiredRole && decoded.user.role !== requiredRole) {
         res.status(403).json({ message: 'Não autorizado' });
         return;
        }

        next();
    } catch (err) {
        res.status(401).json({ message: 'Token inválido' });
    }
};