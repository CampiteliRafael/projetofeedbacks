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
    console.log(`\n--- Middleware Auth ---`); // Log de entrada
    console.log(`Recebida requisição: ${req.method} ${req.originalUrl}`); // Log método e URL
    console.log(`Role requerida: ${requiredRole || 'Nenhuma (apenas autenticação)'}`);
    // Obter o token do header Authorization
    const authHeader = req.header('Authorization'); // Mude para 'Authorization'
    console.log(`Header Authorization: ${authHeader ? 'Presente' : 'Ausente'}`);
    // Verificar se o header existe e está no formato Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("Middleware Auth: Falha - Sem token ou formato Bearer inválido.");
        res.status(401).json({ message: 'Sem token ou formato inválido, autorização negada' });
        return;
    }

    // Extrair o token (remover 'Bearer ')
    const token = authHeader.split(' ')[1];

    if (!token) {
        console.log("Middleware Auth: Falha - Token não encontrado após Bearer.");
        res.status(401).json({ message: 'Token não encontrado após Bearer, autorização negada' });
        return;
    }

    // Verificar token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as UserPayload;
        console.log("Middleware Auth: Token verificado com sucesso. Payload:", decoded);
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
            console.log(`Middleware Auth: Usuário ${req.user.username} (Role: ${req.user.role}) anexado à requisição.`);
            res.status(403).json({ message: 'Acesso não autorizado para esta role' }); // Mensagem mais específica
            return;
        }
        console.log("Middleware Auth: Autorização OK. Chamando next().");
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token inválido' });
    }
};