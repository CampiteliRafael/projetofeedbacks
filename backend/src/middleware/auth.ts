// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
    user: {
        id: string;
        role: string;
        // Adicione username se também estiver no payload e for útil
        username?: string;
    };
     // Inclua iat e exp do JWT
     iat?: number;
     exp?: number;
}

// Interface para estender o Request do Express
export interface RequestWithUser extends Request {
    user?: UserPayload['user']; // Define a propriedade user como opcional
}


export const auth = (requiredRole?: string) => (req: RequestWithUser, res: Response, next: NextFunction) => {

    // Obter o token do header Authorization
    const authHeader = req.header('Authorization'); // Mude para 'Authorization'

    // Verificar se o header existe e está no formato Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Sem token ou formato inválido, autorização negada' });
        return;
    }

    // Extrair o token (remover 'Bearer ')
    const token = authHeader.split(' ')[1];

    if (!token) {
         res.status(401).json({ message: 'Token não encontrado após Bearer, autorização negada' });
         return;
    }

    // Verificar token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as UserPayload;

        // Adicionar informações do usuário ao objeto de requisição
        // req.user = decoded.user; // Agora req tem o tipo RequestWithUser

        // <<< ATENÇÃO: Verifique se seu payload JWT realmente tem um objeto 'user' dentro dele >>>
        // O payload que você cria em authController é: { user: { id: user.id, role: user.role } }
        // Então decoded.user existe. Se o payload fosse direto { id: ..., role: ... }, seria só 'decoded'
        if (!decoded.user) {
             console.error("Payload do token não contém a propriedade 'user'. Payload:", decoded);
             res.status(401).json({ message: 'Token inválido (payload incorreto)' });
             return;
        }
        req.user = decoded.user;


        // Verificar se a role do usuário corresponde à role necessária (se houver)
        if (requiredRole && decoded.user.role !== requiredRole) {
            res.status(403).json({ message: 'Acesso não autorizado para esta role' }); // Mensagem mais específica
            return;
        }

        next();
    } catch (err) {
        res.status(401).json({ message: 'Token inválido' });
    }
};