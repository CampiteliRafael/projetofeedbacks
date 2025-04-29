import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { register, login } from '../authController';
import User from '../../models/User';
import jwt from 'jsonwebtoken';
import { RequestWithUser } from '../../middleware/auth';

// Mock do Modelo User e jsonwebtoken
jest.mock('../../models/User');
jest.mock('jsonwebtoken');

// --- Bloco Principal de Descrição ---
describe('Auth Controller', () => {

    // Mocks reutilizáveis para req, res e next
    let mockReq: Partial<RequestWithUser>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock; 
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;

    // Setup Comum - Roda ANTES de cada 'it'
    beforeEach(() => {
        jest.clearAllMocks();

        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        mockNext = jest.fn(); 

        mockReq = {
            body: {},
            user: undefined
        };
        mockRes = {
            status: mockStatus,
            json: mockJson,
        };

        // Configuração do mock da classe User
        const mockSave = jest.fn();
        const mockComparePassword = jest.fn();
        (User as jest.MockedClass<typeof User>).mockImplementation((userData: any) => ({
            ...userData,
            _id: new mongoose.Types.ObjectId().toString(), 
            role: 'user',
            save: mockSave,
            comparePassword: mockComparePassword,
        }) as any);
        (User.findOne as jest.Mock).mockReset();
        (jwt.sign as jest.Mock).mockReset();
    });

    // --- Testes para a função register ---
    describe('Register function', () => {

        it('deve registrar um novo usuário com sucesso e retornar um token', async () => {
            
            mockReq.body = { username: 'newUser', password: 'password123' };
            (User.findOne as jest.Mock).mockResolvedValue(null);
            const mockUserInstance = new User(mockReq.body);
            (mockUserInstance.save as jest.Mock).mockResolvedValue(mockUserInstance);
            const mockToken = 'mockJwtToken123';
            (jwt.sign as jest.Mock).mockImplementation((payload, secret, options, callback) => {
                callback(null, mockToken);
            });

            await register(mockReq as Request, mockRes as Response, mockNext);

            expect(User.findOne).toHaveBeenCalledWith({ username: 'newUser' });
            expect(User).toHaveBeenCalledWith({ username: 'newUser', password: 'password123' });
            expect(mockUserInstance.save).toHaveBeenCalledTimes(1);
            expect(jwt.sign).toHaveBeenCalledTimes(1);
            expect(jwt.sign).toHaveBeenCalledWith(
                 expect.objectContaining({ user: expect.objectContaining({ role: 'user', username: 'newUser' }) }),
                 expect.any(String),
                 expect.any(Object),
                 expect.any(Function)
            );
            expect(mockRes.json).toHaveBeenCalledWith({ token: mockToken });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('deve retornar 400 se o usuário já existir', async () => {
            
            mockReq.body = { username: 'existingUser', password: 'password123' };
            (User.findOne as jest.Mock).mockResolvedValue({ username: 'existingUser', _id: 'abc' });

            await register(mockReq as Request, mockRes as Response, mockNext);

            expect(User.findOne).toHaveBeenCalledWith({ username: 'existingUser' });
            expect(User).not.toHaveBeenCalled();
            expect(jwt.sign).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Usuário já existe' });
            expect(mockNext).not.toHaveBeenCalled();
        });

         it('deve retornar 500 se ocorrer erro ao buscar usuário (findOne)', async () => {
          
            mockReq.body = { username: 'newUser', password: 'password123' };
            const dbError = new Error("Falha ao conectar no DB");
            (User.findOne as jest.Mock).mockRejectedValue(dbError);

            await register(mockReq as Request, mockRes as Response, mockNext); 

            expect(User.findOne).toHaveBeenCalledWith({ username: 'newUser' });
            expect(User).not.toHaveBeenCalled();
            expect(jwt.sign).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Erro no servidor durante o registro' });
            expect(mockNext).not.toHaveBeenCalled();
        });

         it('deve retornar 500 se ocorrer erro ao salvar usuário (save)', async () => {
            
            mockReq.body = { username: 'newUser', password: 'password123' };
            (User.findOne as jest.Mock).mockResolvedValue(null);
            const mockUserInstance = new User(mockReq.body);
            const dbError = new Error("Falha ao salvar");
            (mockUserInstance.save as jest.Mock).mockRejectedValue(dbError);

            await register(mockReq as Request, mockRes as Response, mockNext);

            expect(User.findOne).toHaveBeenCalledWith({ username: 'newUser' });
            expect(mockUserInstance.save).toHaveBeenCalledTimes(1);
            expect(jwt.sign).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Erro no servidor durante o registro' });
            expect(mockNext).not.toHaveBeenCalled();
         });

          it('deve retornar 500 se ocorrer erro ao gerar token (jwt.sign)', async () => {
            
            mockReq.body = { username: 'newUser', password: 'password123' };
            (User.findOne as jest.Mock).mockResolvedValue(null);
            const mockUserInstance = new User(mockReq.body);
            (mockUserInstance.save as jest.Mock).mockResolvedValue(mockUserInstance);
            const jwtError = new Error("Falha no JWT");
            (jwt.sign as jest.Mock).mockImplementation((payload, secret, options, callback) => {
                callback(jwtError, null);
            });

            await register(mockReq as Request, mockRes as Response, mockNext);

             expect(jwt.sign).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Erro interno ao gerar token' });
            expect(mockNext).not.toHaveBeenCalled();
          });

    }); 

    // --- Testes para a função login ---
    describe('Login function', () => {

        it('deve logar com sucesso e retornar um token...', async () => {
           
             mockReq.body = { username: 'testUser', password: 'correctPassword' };
             const mockExistingUserInstance = new User({ username: 'testUser' });
             (User.findOne as jest.Mock).mockResolvedValue(mockExistingUserInstance);
             (mockExistingUserInstance.comparePassword as jest.Mock).mockResolvedValue(true);
             const mockToken = 'loginToken456';
             (jwt.sign as jest.Mock).mockImplementation((payload, secret, options, callback) => {
                  callback(null, mockToken);
             });

            await login(mockReq as Request, mockRes as Response, mockNext);

            expect(User.findOne).toHaveBeenCalledWith({ username: 'testUser' });
            expect(mockExistingUserInstance.comparePassword).toHaveBeenCalledWith('correctPassword');
            expect(jwt.sign).toHaveBeenCalledTimes(1);
            expect(jwt.sign).toHaveBeenCalledWith(
                 expect.objectContaining({ user: expect.objectContaining({ username: 'testUser', role: 'user' }) }),
                 expect.any(String),
                 expect.any(Object),
                 expect.any(Function)
            );
            expect(mockRes.json).toHaveBeenCalledWith({ token: mockToken });
             expect(mockNext).not.toHaveBeenCalled();
        });

        it('deve retornar 400 se o usuário não for encontrado', async () => {
          
            mockReq.body = { username: 'nonExistentUser', password: 'password123' };
            (User.findOne as jest.Mock).mockResolvedValue(null);

            await login(mockReq as Request, mockRes as Response, mockNext);

            expect(User.findOne).toHaveBeenCalledWith({ username: 'nonExistentUser' });
            expect(jwt.sign).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ message: expect.stringContaining('Credenciais inválidas') });
             expect(mockNext).not.toHaveBeenCalled();
        });

         it('deve retornar 400 se a senha estiver incorreta', async () => {
           
            mockReq.body = { username: 'testUser', password: 'wrongPassword' };
            const mockExistingUserInstance = new User({ username: 'testUser' });
            (User.findOne as jest.Mock).mockResolvedValue(mockExistingUserInstance);
            (mockExistingUserInstance.comparePassword as jest.Mock).mockResolvedValue(false);

            await login(mockReq as Request, mockRes as Response, mockNext);

            expect(User.findOne).toHaveBeenCalledWith({ username: 'testUser' });
            expect(mockExistingUserInstance.comparePassword).toHaveBeenCalledWith('wrongPassword');
            expect(jwt.sign).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ message: expect.stringContaining('Credenciais inválidas') });
            expect(mockNext).not.toHaveBeenCalled();
         });

         it('deve retornar 500 se ocorrer erro ao buscar usuário (findOne)', async () => {
             
             mockReq.body = { username: 'testUser', password: 'password123' };
             const dbError = new Error("Falha ao buscar usuário");
             (User.findOne as jest.Mock).mockRejectedValue(dbError);

             await login(mockReq as Request, mockRes as Response, mockNext); 

             expect(User.findOne).toHaveBeenCalledWith({ username: 'testUser' });
             expect(jwt.sign).not.toHaveBeenCalled();
             expect(mockStatus).toHaveBeenCalledWith(500);
             expect(mockJson).toHaveBeenCalledWith({ message: 'Erro no servidor durante o login' });
             expect(mockNext).not.toHaveBeenCalled();
         });

         it('deve retornar 500 se ocorrer erro ao comparar senha (comparePassword)', async () => {
             
             mockReq.body = { username: 'testUser', password: 'correctPassword' };
             const mockExistingUserInstance = new User({ username: 'testUser' });
             (User.findOne as jest.Mock).mockResolvedValue(mockExistingUserInstance);
             const compareError = new Error("Erro no bcrypt");
             (mockExistingUserInstance.comparePassword as jest.Mock).mockRejectedValue(compareError);

             await login(mockReq as Request, mockRes as Response, mockNext); 

             expect(User.findOne).toHaveBeenCalledWith({ username: 'testUser' });
             expect(mockExistingUserInstance.comparePassword).toHaveBeenCalledWith('correctPassword');
             expect(jwt.sign).not.toHaveBeenCalled();
             expect(mockStatus).toHaveBeenCalledWith(500);
             expect(mockJson).toHaveBeenCalledWith({ message: 'Erro no servidor durante o login' });
             expect(mockNext).not.toHaveBeenCalled();
         });

          it('deve retornar 500 se ocorrer erro ao gerar token (jwt.sign)', async () => {
          
             mockReq.body = { username: 'testUser', password: 'correctPassword' };
             const mockExistingUserInstance = new User({ username: 'testUser' });
             (User.findOne as jest.Mock).mockResolvedValue(mockExistingUserInstance);
             (mockExistingUserInstance.comparePassword as jest.Mock).mockResolvedValue(true);
             const jwtError = new Error("Falha no JWT");
             (jwt.sign as jest.Mock).mockImplementation((payload, secret, options, callback) => {
                  callback(jwtError, null);
             });

             await login(mockReq as Request, mockRes as Response, mockNext); 

             expect(jwt.sign).toHaveBeenCalledTimes(1);
             expect(mockStatus).toHaveBeenCalledWith(500);
             expect(mockJson).toHaveBeenCalledWith({ message: 'Erro interno ao gerar token' });
             expect(mockNext).not.toHaveBeenCalled();
          });

    });

});