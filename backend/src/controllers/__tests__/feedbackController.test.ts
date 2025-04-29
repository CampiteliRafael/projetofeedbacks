import { Request, Response } from 'express';
import {
    updateFeedbackStatus, getAllFeedbacks,
    createFeedback,
    deleteFeedback
} from '../feedbackController';
import Feedback from '../../models/Feedback';
import mongoose from 'mongoose';
import { RequestWithUser } from '../../middleware/auth';

// Mock do Modelo Feedback
jest.mock('../../models/Feedback');

// --- Bloco Principal de Descrição ---
describe('Feedback Controller', () => {

    // Mocks reutilizáveis para req e res
    let mockReq: Partial<RequestWithUser>;
    let mockRes: Partial<Response>;
    let mockStatus: jest.Mock;
    let mockJson: jest.Mock;
    let mockSend: jest.Mock; // Adicionado para flexibilidade

    // Setup Comum - Roda ANTES de cada 'it'
    beforeEach(() => {
        jest.clearAllMocks(); // Limpa mocks anteriores

        // Mocks para funções de resposta do Express
        mockJson = jest.fn();
        mockSend = jest.fn();
        mockStatus = jest.fn().mockImplementation((_statusCode: number) => {
            // Armazena o status code para verificações futuras se necessário
            // mockRes.statusCode = statusCode; // Descomente se precisar checar o status code diretamente
            return { json: mockJson, send: mockSend }; // Permite encadear .status().json() ou .status().send()
        });

        // Objeto mock de requisição básico
        mockReq = {
            params: {},
            body: {},
            user: { // Simula usuário 'user' logado por padrão
                id: 'testUserId',
                role: 'user',
                username: 'testUser'
            }
        };
        // Objeto mock de resposta básico
        mockRes = {
            status: mockStatus,
            json: mockJson,
            send: mockSend,
        };
    });

    // --- Testes para updateFeedbackStatus ---
    describe('updateFeedbackStatus Controller', () => {

        it('deve atualizar o status para "aprovado" e retornar 200 com o feedback atualizado', async () => {
           
            const feedbackId = new mongoose.Types.ObjectId().toString();
            const newStatus = 'aprovado';
            const mockUpdatedFeedback = { _id: feedbackId, name: 'Teste', status: newStatus, /* ... outros campos ... */ };
            mockReq.params = { id: feedbackId };
            mockReq.body = { status: newStatus };
            (Feedback.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedFeedback);

            await updateFeedbackStatus(mockReq as RequestWithUser, mockRes as Response, jest.fn());

            expect(Feedback.findByIdAndUpdate).toHaveBeenCalledWith(feedbackId, { status: newStatus }, { new: true, runValidators: true });
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockUpdatedFeedback);
        });

        it('deve retornar 400 se o ID for inválido', async () => {
           
            mockReq.params = { id: 'id-invalido' };
            mockReq.body = { status: 'aprovado' };

            await updateFeedbackStatus(mockReq as RequestWithUser, mockRes as Response, jest.fn());

            expect(Feedback.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ message: 'ID de feedback inválido' });
        });

        it('deve retornar 400 se o status for inválido', async () => {
           
            const feedbackId = new mongoose.Types.ObjectId().toString();
            mockReq.params = { id: feedbackId };
            mockReq.body = { status: 'status_errado' }; 

            await updateFeedbackStatus(mockReq as RequestWithUser, mockRes as Response, jest.fn());

            expect(Feedback.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Status inválido') }));
        });

        it('deve retornar 404 se findByIdAndUpdate não encontrar o feedback', async () => {
          
            const feedbackId = new mongoose.Types.ObjectId().toString();
            mockReq.params = { id: feedbackId };
            mockReq.body = { status: 'aprovado' };
            (Feedback.findByIdAndUpdate as jest.Mock).mockResolvedValue(null); 

            await updateFeedbackStatus(mockReq as RequestWithUser, mockRes as Response, jest.fn());

            expect(Feedback.findByIdAndUpdate).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Feedback não encontrado' });
        });

        it('deve retornar 500 se ocorrer um erro no banco de dados', async () => {
        
            const feedbackId = new mongoose.Types.ObjectId().toString();
            mockReq.params = { id: feedbackId };
            mockReq.body = { status: 'aprovado' };
            const dbError = new Error("Erro simulado do DB");
            (Feedback.findByIdAndUpdate as jest.Mock).mockRejectedValue(dbError);

            await updateFeedbackStatus(mockReq as RequestWithUser, mockRes as Response, jest.fn());

            expect(Feedback.findByIdAndUpdate).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Erro interno ao atualizar status do feedback' });
        });
    }); 

    // --- Testes para getAllFeedbacks ---
    describe('getAllFeedbacks Controller', () => {

        it('deve retornar status 200 e uma lista de feedbacks', async () => {
            
            const mockFeedbacks = [{ _id: 'id1', name: 'User1' }, { _id: 'id2', name: 'User2' }];
            const mockSort = jest.fn().mockResolvedValue(mockFeedbacks);
            (Feedback.find as jest.Mock).mockReturnValue({ sort: mockSort });

            await getAllFeedbacks(mockReq as RequestWithUser, mockRes as Response);

            expect(Feedback.find).toHaveBeenCalledTimes(1);
            expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(mockRes.json).toHaveBeenCalledWith(mockFeedbacks);
        });

        it('deve retornar status 500 se ocorrer um erro no banco de dados', async () => {
            
            const dbError = new Error("Erro ao buscar no DB");
            const mockSort = jest.fn().mockRejectedValue(dbError);
            const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
            (Feedback.find as jest.Mock).mockReturnValue({ populate: mockPopulate });

            await getAllFeedbacks(mockReq as RequestWithUser, mockRes as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Erro interno ao buscar feedbacks' });
        });
    }); 

    // --- Testes para createFeedback ---
    describe('createFeedback Controller', () => {

        it('deve criar um feedback com sucesso e retornar 201', async () => {
        
            const inputData = { name: 'Novo User', message: 'Nova Mensagem' };
            const expectedUserId = 'testUserId';
            const mockCreatedFeedback = { _id: 'newId', ...inputData, userId: expectedUserId, status: 'pendente' };
            mockReq.body = inputData;
            (Feedback.create as jest.Mock).mockResolvedValue(mockCreatedFeedback);

            await createFeedback(mockReq as RequestWithUser, mockRes as Response);

            expect(Feedback.create).toHaveBeenCalledWith({ name: inputData.name, message: inputData.message, userId: expectedUserId });
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith(mockCreatedFeedback);
        });

        it('deve retornar 400 se nome ou mensagem estiverem faltando', async () => {
           
            mockReq.body = { name: 'User' }; 

            await createFeedback(mockReq as RequestWithUser, mockRes as Response);

            expect(Feedback.create).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Nome e mensagem são obrigatórios.' });
        });

        it('deve retornar 401 se o usuário não estiver autenticado', async () => {
           
            mockReq.user = undefined;
            mockReq.body = { name: 'User', message: 'Msg' };

            await createFeedback(mockReq as RequestWithUser, mockRes as Response);

            expect(Feedback.create).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Usuário não autenticado corretamente.' });
        });

        it('deve retornar 403 se o usuário for admin', async () => {
            
            mockReq.user = { id: 'adminId', role: 'adm', username: 'admin' }; // Simula usuário admin
            mockReq.body = { name: 'Admin User', message: 'Msg' };

            await createFeedback(mockReq as RequestWithUser, mockRes as Response);

            expect(Feedback.create).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Administradores não podem criar feedbacks por esta rota.' });
        });

        it('deve retornar 500 se ocorrer um erro no banco de dados', async () => {
           
            mockReq.body = { name: 'User', message: 'Msg' };
            const dbError = new Error("Erro ao criar no DB");
            (Feedback.create as jest.Mock).mockRejectedValue(dbError);

            await createFeedback(mockReq as RequestWithUser, mockRes as Response);

            expect(Feedback.create).toHaveBeenCalledTimes(1);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ message: 'Erro interno ao salvar feedback' }));
        });
    }); 


    // --- Testes para deleteFeedback ---
    describe('deleteFeedback Controller', () => {

        it('deve deletar um feedback com sucesso e retornar 200', async () => {
           
            const feedbackId = new mongoose.Types.ObjectId().toString();
            mockReq.params = { id: feedbackId };
            (Feedback.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: feedbackId }); // Simula encontrado e deletado

            await deleteFeedback(mockReq as RequestWithUser, mockRes as Response, jest.fn());

            expect(Feedback.findByIdAndDelete).toHaveBeenCalledWith(feedbackId);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Feedback deletado com sucesso' });
        });

        it('deve retornar 400 se o ID for inválido', async () => {
   
            mockReq.params = { id: 'id-invalido' };

            await deleteFeedback(mockReq as RequestWithUser, mockRes as Response, jest.fn());

            expect(Feedback.findByIdAndDelete).not.toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ message: 'ID inválido' });
        });

        it('deve retornar 404 se o feedback não for encontrado', async () => {

            const feedbackId = new mongoose.Types.ObjectId().toString();
            mockReq.params = { id: feedbackId };
            (Feedback.findByIdAndDelete as jest.Mock).mockResolvedValue(null); // Simula não encontrado

            await deleteFeedback(mockReq as RequestWithUser, mockRes as Response, jest.fn());

            expect(Feedback.findByIdAndDelete).toHaveBeenCalledWith(feedbackId);
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Feedback não encontrado' });
        });

        it('deve retornar 500 se ocorrer um erro no banco de dados', async () => {
           
            const feedbackId = new mongoose.Types.ObjectId().toString();
            mockReq.params = { id: feedbackId };
            const dbError = new Error("Erro ao deletar no DB");
            (Feedback.findByIdAndDelete as jest.Mock).mockRejectedValue(dbError);

            await deleteFeedback(mockReq as RequestWithUser, mockRes as Response, jest.fn());

            expect(Feedback.findByIdAndDelete).toHaveBeenCalledWith(feedbackId);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Erro interno ao deletar o feedback' });
        });
    }); 

});