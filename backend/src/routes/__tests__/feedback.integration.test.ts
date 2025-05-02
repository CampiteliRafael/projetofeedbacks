import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import app from '../../app'; 
import User, { IUser } from '../../models/User';
import Feedback, { IFeedback } from '../../models/Feedback';

// Carrega variáveis de ambiente do .env (importante para JWT_SECRET)
dotenv.config();

// --- Variáveis Globais para Testes ---
let mongoServer: MongoMemoryServer;
let adminUser: IUser;
let regularUser: IUser;
let adminToken: string;
let userToken: string;

// --- Funções Auxiliares ---
const generateToken = (user: { id: string; role: string; username: string }): string => {
    const payload = { user }; 
    const secret = process.env.JWT_SECRET || 'secret'; 
    const expiresIn = 3600; 
    const options: jwt.SignOptions = { 
        expiresIn: expiresIn
    };
    return jwt.sign(payload, secret, options);
};

// --- Setup e Teardown do Banco de Dados ---
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create(); 
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri); 
});

afterAll(async () => {
    await mongoose.disconnect(); 
    await mongoServer.stop(); 
});

// --- Setup Antes de Cada Teste ---
beforeEach(async () => {
  
    await User.deleteMany({});
    await Feedback.deleteMany({});

    adminUser = await User.create({ username: 'testadmin', password: 'password123', role: 'adm' });
    regularUser = await User.create({ username: 'testuser', password: 'password123', role: 'user' });

    adminToken = generateToken({ id: adminUser.id, role: adminUser.role, username: adminUser.username });
    userToken = generateToken({ id: regularUser.id, role: regularUser.role, username: regularUser.username });
});

// --- Suíte de Testes para Endpoints de Feedback ---
describe('/api/feedbacks API Endpoints', () => {

    // --- Testes para POST /api/feedbacks (Create) ---
    describe('POST /api/feedbacks', () => {
        const feedbackData = { name: 'Test User Name', message: 'This is a test feedback message.' };

        it('deve retornar 401 se nenhum token for fornecido', async () => {
            const response = await request(app)
                .post('/api/feedbacks')
                .send(feedbackData);

            expect(response.status).toBe(401);
            expect(response.body.message).toContain('Sem token');
        });

        it('deve retornar 403 se um token de admin for fornecido', async () => {
            const response = await request(app)
                .post('/api/feedbacks')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(feedbackData);

            expect(response.status).toBe(403);
            expect(response.body.message).toContain('Administradores não podem criar');
        });

        it('deve retornar 400 se faltar "name" ou "message"', async () => {
             const response = await request(app)
                .post('/api/feedbacks')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Only Name' });

            expect(response.status).toBe(400);
            expect(response.body.message).toContain('obrigatórios');
        });


        it('deve criar um feedback (status 201) se um token de user válido e dados válidos forem fornecidos', async () => {
            const response = await request(app)
                .post('/api/feedbacks')
                .set('Authorization', `Bearer ${userToken}`)
                .send(feedbackData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.name).toBe(feedbackData.name);
            expect(response.body.message).toBe(feedbackData.message);
            expect(response.body.userId).toBe(regularUser.id); 
            expect(response.body.status).toBe('pendente'); 

            const savedFeedback = await Feedback.findById(response.body._id);
            expect(savedFeedback).toBeTruthy();
            expect(savedFeedback?.message).toBe(feedbackData.message);
            expect(savedFeedback?.userId.toString()).toBe(regularUser.id);
            expect(savedFeedback?.status).toBe('pendente');
        });
    });

    // --- Testes para GET /api/feedbacks (List All - Admin Only) ---
    describe('GET /api/feedbacks', () => {
         it('deve retornar 401 se nenhum token for fornecido', async () => {
             const response = await request(app).get('/api/feedbacks');
             expect(response.status).toBe(401);
         });

         it('deve retornar 403 se um token de user for fornecido', async () => {
             const response = await request(app)
                 .get('/api/feedbacks')
                 .set('Authorization', `Bearer ${userToken}`);
             expect(response.status).toBe(403); 
         });

         it('deve retornar 200 e uma lista de feedbacks se um token de admin for fornecido', async () => {
             
             await Feedback.create({ name: 'fb1', message: 'msg1', userId: regularUser.id });
             await Feedback.create({ name: 'fb2', message: 'msg2', userId: regularUser.id, status: 'aprovado' });

             const response = await request(app)
                 .get('/api/feedbacks')
                 .set('Authorization', `Bearer ${adminToken}`); 

             expect(response.status).toBe(200);
             expect(Array.isArray(response.body)).toBe(true);
             expect(response.body.length).toBe(2); 
             expect(response.body[0].message).toBe('msg2'); 
             expect(response.body[1].message).toBe('msg1');
         });
    });

    // --- Testes para GET /api/feedbacks/my-feedbacks (List User's Own) ---
     describe('GET /api/feedbacks/my-feedbacks', () => {
        it('deve retornar 401 se nenhum token for fornecido', async () => {
            const response = await request(app).get('/api/feedbacks/my-feedbacks');
            expect(response.status).toBe(401);
        });

        it('deve retornar 200 e apenas os feedbacks do usuário logado', async () => {
    
             await Feedback.create({ name: 'userFb1', message: 'userMsg1', userId: regularUser.id });
             await Feedback.create({ name: 'userFb2', message: 'userMsg2', userId: regularUser.id, status: 'rejeitado' });
             await Feedback.create({ name: 'adminFb1', message: 'adminMsg1', userId: adminUser.id });

             const response = await request(app)
                 .get('/api/feedbacks/my-feedbacks')
                 .set('Authorization', `Bearer ${userToken}`);

             expect(response.status).toBe(200);
             expect(Array.isArray(response.body)).toBe(true);
             expect(response.body.length).toBe(2); 
             expect(response.body[0].message).toBe('userMsg2'); 
             expect(response.body[1].message).toBe('userMsg1');
             response.body.forEach((fb: IFeedback) => {
                 expect(fb.userId.toString()).toBe(regularUser.id);
             });
        });

         it('deve retornar 200 e uma lista vazia se o usuário não tiver feedbacks', async () => {
              await Feedback.create({ name: 'adminFb1', message: 'adminMsg1', userId: adminUser.id });

              const response = await request(app)
                 .get('/api/feedbacks/my-feedbacks')
                 .set('Authorization', `Bearer ${userToken}`);

              expect(response.status).toBe(200);
              expect(Array.isArray(response.body)).toBe(true);
              expect(response.body.length).toBe(0);
         });
     });

    // --- Testes para GET /api/feedbacks/stats (Admin Only) ---
     describe('GET /api/feedbacks/stats', () => {
        it('deve retornar 401 se nenhum token for fornecido', async () => {
            const response = await request(app).get('/api/feedbacks/stats');
            expect(response.status).toBe(401);
        });

         it('deve retornar 403 se um token de user for fornecido', async () => {
             const response = await request(app)
                 .get('/api/feedbacks/stats')
                 .set('Authorization', `Bearer ${userToken}`);
             expect(response.status).toBe(403);
         });

         it('deve retornar 200 e as estatísticas corretas para o admin', async () => {
            
              await Feedback.create({ name: 'n1', message: 'm1', userId: regularUser.id, status: 'aprovado' });
              await Feedback.create({ name: 'n2', message: 'm2', userId: regularUser.id, status: 'aprovado' });
              await Feedback.create({ name: 'n3', message: 'm3', userId: regularUser.id, status: 'rejeitado' });
              await Feedback.create({ name: 'n4', message: 'm4', userId: adminUser.id });

              const response = await request(app)
                 .get('/api/feedbacks/stats')
                 .set('Authorization', `Bearer ${adminToken}`);

              expect(response.status).toBe(200);
              expect(response.body).toEqual({
                  total: 4,
                  pending: 1,
                  approved: 2,
                  rejected: 1
              });
         });
     });

    // --- Testes para PATCH /api/feedbacks/:id/status (Admin Only) ---
    describe('PATCH /api/feedbacks/:id/status', () => {
        let feedbackPendente: IFeedback;

        beforeEach(async () => {
             
            feedbackPendente = await Feedback.create({ name: 'Pending', message: 'Needs review', userId: regularUser.id });
        });

        it('deve retornar 401 se nenhum token for fornecido', async () => {
            const response = await request(app)
                .patch(`/api/feedbacks/${feedbackPendente.id}/status`)
                .send({ status: 'aprovado' });
            expect(response.status).toBe(401);
        });

         it('deve retornar 403 se um token de user for fornecido', async () => {
              const response = await request(app)
                 .patch(`/api/feedbacks/${feedbackPendente.id}/status`)
                 .set('Authorization', `Bearer ${userToken}`)
                 .send({ status: 'aprovado' });
              expect(response.status).toBe(403);
         });

          it('deve retornar 400 se o status fornecido for inválido', async () => {
               const response = await request(app)
                 .patch(`/api/feedbacks/${feedbackPendente.id}/status`)
                 .set('Authorization', `Bearer ${adminToken}`)
                 .send({ status: 'status_invalido' });
               expect(response.status).toBe(400);
               expect(response.body.message).toContain('Status inválido');
          });

           it('deve retornar 400 se nenhum status for fornecido', async () => {
                const response = await request(app)
                 .patch(`/api/feedbacks/${feedbackPendente.id}/status`)
                 .set('Authorization', `Bearer ${adminToken}`)
                 .send({});
                expect(response.status).toBe(400);
                expect(response.body.message).toContain('Status inválido');
           });

            it('deve retornar 404 se o ID do feedback não existir', async () => {
                 const nonExistentId = new mongoose.Types.ObjectId().toString();
                 const response = await request(app)
                    .patch(`/api/feedbacks/${nonExistentId}/status`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ status: 'aprovado' });
                 expect(response.status).toBe(404);
                 expect(response.body.message).toContain('Feedback não encontrado');
            });

            it('deve atualizar o status para "aprovado" com sucesso para admin', async () => {
                 const response = await request(app)
                    .patch(`/api/feedbacks/${feedbackPendente.id}/status`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ status: 'aprovado' });

                 expect(response.status).toBe(200);
                 expect(response.body).toHaveProperty('_id', feedbackPendente.id);
                 expect(response.body.status).toBe('aprovado');

                 const updatedFeedback = await Feedback.findById(feedbackPendente.id);
                 expect(updatedFeedback?.status).toBe('aprovado');
            });

             it('deve atualizar o status para "rejeitado" com sucesso para admin', async () => {
                 const response = await request(app)
                    .patch(`/api/feedbacks/${feedbackPendente.id}/status`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ status: 'rejeitado' });

                 expect(response.status).toBe(200);
                 expect(response.body.status).toBe('rejeitado');

                 const updatedFeedback = await Feedback.findById(feedbackPendente.id);
                 expect(updatedFeedback?.status).toBe('rejeitado');
             });
    });

    // --- Testes para DELETE /api/feedbacks/:id (Admin Only) ---
    describe('DELETE /api/feedbacks/:id', () => {
        let feedbackToDelete: IFeedback;

        beforeEach(async () => {
           
            feedbackToDelete = await Feedback.create({ name: 'ToDelete', message: 'Delete me', userId: regularUser.id });
        });

        it('deve retornar 401 se nenhum token for fornecido', async () => {
            const response = await request(app).delete(`/api/feedbacks/${feedbackToDelete.id}`);
            expect(response.status).toBe(401);
        });

         it('deve retornar 403 se um token de user for fornecido', async () => {
             const response = await request(app)
                 .delete(`/api/feedbacks/${feedbackToDelete.id}`)
                 .set('Authorization', `Bearer ${userToken}`);
             expect(response.status).toBe(403);
         });

         it('deve retornar 404 se o ID do feedback não existir', async () => {
             const nonExistentId = new mongoose.Types.ObjectId().toString();
             const response = await request(app)
                .delete(`/api/feedbacks/${nonExistentId}`)
                .set('Authorization', `Bearer ${adminToken}`);
             expect(response.status).toBe(404);
         });

          it('deve retornar 400 se o ID for inválido', async () => {
              const response = await request(app)
                .delete(`/api/feedbacks/invalid-id-format`)
                .set('Authorization', `Bearer ${adminToken}`);
              expect(response.status).toBe(400);
          });

         it('deve deletar o feedback com sucesso e retornar 200 para admin', async () => {
             const response = await request(app)
                .delete(`/api/feedbacks/${feedbackToDelete.id}`)
                .set('Authorization', `Bearer ${adminToken}`);

             expect(response.status).toBe(200);
             expect(response.body.message).toContain('deletado com sucesso');

             const deletedFeedback = await Feedback.findById(feedbackToDelete.id);
             expect(deletedFeedback).toBeNull();
         });
    });

});