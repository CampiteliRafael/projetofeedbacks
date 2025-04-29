import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
interface UserPayload {
    user: {
        id: string;
        role: string;
        username?: string;
    };
    iat?: number;
    exp?: number;
}
export interface RequestWithUser extends Request {
    user?: UserPayload['user'];
}


export const auth = (requiredRole?: string) => (req: RequestWithUser, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization'); 
   
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Sem token ou formato inválido, autorização negada' });
        return;
    }
    const token = authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Token não encontrado após Bearer, autorização negada' });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as UserPayload;
        
        if (!decoded.user) {
            console.error("Payload do token não contém a propriedade 'user'. Payload:", decoded);
            res.status(401).json({ message: 'Token inválido (payload incorreto)' });
            return;
        }
        req.user = decoded.user;


        if (requiredRole && decoded.user.role !== requiredRole) {
            console.log(`Middleware Auth: Usuário ${req.user.username} (Role: ${req.user.role}) anexado à requisição.`);
            res.status(403).json({ message: 'Acesso não autorizado para esta role' }); // Mensagem mais específica
            return;
        }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token inválido' });
    }
};