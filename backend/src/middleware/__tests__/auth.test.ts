import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { auth, RequestWithUser } from '../auth';

// Mock da biblioteca jsonwebtoken
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {

    let mockReq: Partial<RequestWithUser>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock<NextFunction>; 
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;
    let mockHeader: jest.Mock; 

    beforeEach(() => {
        jest.clearAllMocks(); // Limpa mocks

        // Mocks para response
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });

        // Mock para request (incluindo a função header)
        mockHeader = jest.fn();
        mockReq = {
            header: mockHeader, 
            user: undefined, 
        };

        // Mock para next
        mockNext = jest.fn();

        // Mock para response completo
        mockRes = {
            status: mockStatus,
            json: mockJson,
        };

        (jwt.verify as jest.Mock).mockReset();
    });

    // --- Testes ---
    it('deve retornar 401 se o header Authorization estiver faltando', () => {
 
        mockHeader.mockReturnValue(undefined);

        auth()(mockReq as RequestWithUser, mockRes as Response, mockNext);

        expect(mockHeader).toHaveBeenCalledWith('Authorization');
        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({ message: 'Sem token ou formato inválido, autorização negada' });
        expect(mockNext).not.toHaveBeenCalled(); 
    });

    it('deve retornar 401 se o header Authorization não começar com "Bearer "', () => {
        
        mockHeader.mockReturnValue('InvalidTokenFormat');

        auth()(mockReq as RequestWithUser, mockRes as Response, mockNext);

        expect(mockHeader).toHaveBeenCalledWith('Authorization');
        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({ message: 'Sem token ou formato inválido, autorização negada' });
        expect(mockNext).not.toHaveBeenCalled();
    });

     it('deve retornar 401 se não houver token após "Bearer "', () => {
        
        mockHeader.mockReturnValue('Bearer ');

        auth()(mockReq as RequestWithUser, mockRes as Response, mockNext);

        expect(mockHeader).toHaveBeenCalledWith('Authorization');
        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({ message: 'Token não encontrado após Bearer, autorização negada' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve retornar 401 se jwt.verify lançar um erro (token inválido/expirado)', () => {
    
        const token = 'validToken123';
        mockHeader.mockReturnValue(`Bearer ${token}`);
        const verifyError = new Error("Token verification failed");
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw verifyError; 
        });

        auth()(mockReq as RequestWithUser, mockRes as Response, mockNext);

        expect(mockHeader).toHaveBeenCalledWith('Authorization');
        expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET || 'secret');
        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({ message: 'Token inválido' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve retornar 401 se o payload decodificado não tiver a propriedade "user"', () => {
        
        const token = 'validToken123';
        mockHeader.mockReturnValue(`Bearer ${token}`);
        const invalidPayload = { iat: 123, exp: 456 }; 
        (jwt.verify as jest.Mock).mockReturnValue(invalidPayload);

        auth()(mockReq as RequestWithUser, mockRes as Response, mockNext);

        expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET || 'secret');
        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({ message: 'Token inválido (payload incorreto)' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve chamar next() e adicionar req.user se o token for válido e não houver role requerida', () => {
     
        const token = 'validToken123';
        const mockUserPayload = { id: 'userId', role: 'user', username: 'test' };
        const mockDecoded = { user: mockUserPayload, iat: 123, exp: 456 };
        mockHeader.mockReturnValue(`Bearer ${token}`);
        (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

        auth()(mockReq as RequestWithUser, mockRes as Response, mockNext);

        expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET || 'secret');
        expect(mockReq.user).toEqual(mockUserPayload); 
        expect(mockNext).toHaveBeenCalledTimes(1); 
        expect(mockStatus).not.toHaveBeenCalled(); 
        expect(mockJson).not.toHaveBeenCalled();
    });

    it('deve chamar next() se o token for válido e a role requerida corresponder', () => {

        const token = 'adminToken123';
        const mockUserPayload = { id: 'adminId', role: 'adm', username: 'admin' };
        const mockDecoded = { user: mockUserPayload, iat: 123, exp: 456 };
        mockHeader.mockReturnValue(`Bearer ${token}`);
        (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

        auth('adm')(mockReq as RequestWithUser, mockRes as Response, mockNext);

        expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET || 'secret');
        expect(mockReq.user).toEqual(mockUserPayload);
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockStatus).not.toHaveBeenCalled();
        expect(mockJson).not.toHaveBeenCalled();
    });

    it('deve retornar 403 se o token for válido mas a role requerida não corresponder', () => {
        
        const token = 'userToken123';
        const mockUserPayload = { id: 'userId', role: 'user', username: 'test' };
        const mockDecoded = { user: mockUserPayload, iat: 123, exp: 456 };
        mockHeader.mockReturnValue(`Bearer ${token}`);
        (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

        auth('adm')(mockReq as RequestWithUser, mockRes as Response, mockNext);

        expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET || 'secret');
        expect(mockReq.user).toEqual(mockUserPayload); 
        expect(mockStatus).toHaveBeenCalledWith(403);
        expect(mockJson).toHaveBeenCalledWith({ message: 'Acesso não autorizado para esta role' });
        expect(mockNext).not.toHaveBeenCalled(); 
    });

});