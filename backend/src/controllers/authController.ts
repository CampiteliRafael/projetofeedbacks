import { Request, Response, RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Função para Registrar um Novo Usuário
export const register: RequestHandler = async (req: Request, res: Response): Promise<void> => { // Adicionado Promise<void> para clareza
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            // REMOVA O RETURN AQUI
            res.status(400).json({ message: 'Usuário já existe' });
            return; // Use return simples para sair da função
        }

        // Assumindo que o hash da senha é feito no Mongoose pre-save hook
        user = new User({ username, password });
        await user.save();

        const payload = { user: { id: user.id, role: user.role } }; // Certifique-se que user.id e user.role existem após salvar

        // jwt.sign com callback não se integra bem com async/await diretamente
        // É melhor usar a versão síncrona ou promisificar
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' }, (err, token) => {
            if (err) {
                console.error("Erro ao gerar token:", err); // Log mais detalhado
                // REMOVA O RETURN AQUI
                res.status(500).json({ message: 'Erro interno ao gerar token' });
                // Não precisa de return aqui, pois é o fim do callback
            } else {
                res.json({ token }); // Envia a resposta de sucesso
                // Não precisa de return aqui, pois é o fim do callback
            }
            // Importante: A execução da função register continua APÓS chamar jwt.sign,
            // mas ANTES do callback ser executado. Por isso, não deve haver código
            // aqui que dependa do token ou que tente enviar outra resposta.
        });

        // A função termina aqui, e como jwt.sign foi chamado com callback,
        // a resposta será enviada quando o callback executar. A função register em si
        // resolve implicitamente para void.

    } catch (err: any) {
        console.error("Erro no registro:", err.message); // Log mais detalhado
        // Verifique se a resposta já não foi enviada (edge case)
        if (!res.headersSent) {
             // REMOVA O RETURN AQUI
            res.status(500).json({ message: 'Erro no servidor durante o registro' });
        }
        // Não precisa de return aqui
    }
};

// Função para Fazer Login
export const login: RequestHandler = async (req: Request, res: Response): Promise<void> => { // Adicionado Promise<void> para clareza
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // REMOVA O RETURN AQUI
        res.status(400).json({ errors: errors.array() });
        return; // Use return simples para sair da função
    }

    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username }); // Use const se não for reatribuir
        if (!user) {
            // REMOVA O RETURN AQUI
            res.status(400).json({ message: 'Credenciais inválidas (usuário)' }); // Mensagem um pouco mais específica para debug, se desejar
            return; // Use return simples para sair da função
        }

        // Assumindo que User.comparePassword existe e retorna Promise<boolean>
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // REMOVA O RETURN AQUI
            res.status(400).json({ message: 'Credenciais inválidas (senha)' }); // Mensagem um pouco mais específica para debug, se desejar
            return; // Use return simples para sair da função
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