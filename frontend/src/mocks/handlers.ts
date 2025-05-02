import { http, HttpResponse, delay } from 'msw';
import { Feedback, FeedbackStatus, FeedbackStats } from '../types/Feedback';


const API_BASE_URL = 'http://localhost:5000/api';

let mockFeedbacksDb: Feedback[] = [
    { _id: 'id_pendente_1', name: 'Usuário Teste', message: 'Meu feedback inicial pendente', userId: 'user123', status: 'pendente', createdAt: new Date(Date.now() - 86400000 * 2), updatedAt: new Date(Date.now() - 86400000 * 2) },
    { _id: 'id_aprovado_1', name: 'Outro User', message: 'Este foi aprovado', userId: 'user456', status: 'aprovado', createdAt: new Date(Date.now() - 86400000), updatedAt: new Date(Date.now() - 86400000) },
    { _id: 'id_rejeitado_1', name: 'Usuário Teste', message: 'Este foi rejeitado', userId: 'user123', status: 'rejeitado', createdAt: new Date(Date.now() - 3600000), updatedAt: new Date(Date.now() - 3600000) },
    { _id: 'id_pendente_2', name: 'Mais Um User', message: 'Outro pendente para ações', userId: 'user789', status: 'pendente', createdAt: new Date(), updatedAt: new Date() },
];

const mockUserFeedbacks: Feedback[] = [
    { _id: 'fbUser1', name: 'TestUser', message: 'Meu primeiro feedback (aprovado)', userId: 'user123', status: 'aprovado', createdAt: new Date(Date.now() - 86400000), updatedAt: new Date(Date.now() - 86400000) },
    { _id: 'fbUser2', name: 'TestUser', message: 'Meu segundo feedback (rejeitado)', userId: 'user123', status: 'rejeitado', createdAt: new Date(), updatedAt: new Date() },
];

const checkAuth = (request: Request): boolean => {
     const authHeader = request.headers.get('Authorization');
     return !!(authHeader && authHeader.startsWith('Bearer '));
};

// --- Handlers ---
export const handlers = [

    http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
        const reqBody = await request.json() as any;
        await delay(50);
        if (reqBody.username === 'testuser' && reqBody.password === 'password') {
          return HttpResponse.json({ token: 'mock-token-user-123' }, { status: 200 });
        } else if (reqBody.username === 'testadmin' && reqBody.password === 'password') {
            return HttpResponse.json({ token: 'mock-token-admin-456' }, { status: 200 });
        }
         else {
          return HttpResponse.json({ message: 'Credenciais inválidas (mock)' }, { status: 400 });
        }
    }),

    http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
        const reqBody = await request.json() as any;
        await delay(50);
        if (reqBody.username === 'existinguser') {
            return HttpResponse.json({ message: 'Usuário já existe (mock)' }, { status: 400 });
        }
        if (reqBody.username === 'servererror') {
             return HttpResponse.json({ message: 'Erro interno simulado no registro' }, { status: 500 });
        }
        return new HttpResponse(null, { status: 201 }); 
    }),

    // POST /api/feedbacks (Criar)
    http.post(`${API_BASE_URL}/feedbacks`, async ({ request }) => {
        if (!checkAuth(request)) {
             return HttpResponse.json({ message: 'Sem token (mock)' }, { status: 401 });
        }
        const feedbackData = await request.json() as any;
        if (!feedbackData.message || !feedbackData.name) {
            return HttpResponse.json({ message: 'Nome e Mensagem obrigatórios (mock)' }, { status: 400 });
        }
        await delay(100); 
        const newFeedback: Feedback = {
             _id: `mockId_${Date.now()}`,
             name: feedbackData.name,
             message: feedbackData.message,
             userId: 'mockUserIdFromToken', 
             status: 'pendente',
             createdAt: new Date(),
             updatedAt: new Date(),
        };
        mockFeedbacksDb.push(newFeedback);
        return HttpResponse.json(newFeedback, { status: 201 });
    }),

    // GET /api/feedbacks/my-feedbacks (Feedbacks do Usuário)
    http.get(`${API_BASE_URL}/feedbacks/my-feedbacks`, ({ request }) => {
        console.log("MSW: Interceptado GET /api/feedbacks/my-feedbacks");
        if (!checkAuth(request)) {
            return HttpResponse.json({ message: 'Sem token (mock)' }, { status: 401 });
        }
        return HttpResponse.json(mockUserFeedbacks, { status: 200 });
    }),

    // GET /api/feedbacks (Todos os Feedbacks - Admin)
    http.get(`${API_BASE_URL}/feedbacks`, ({ request }) => {
         if (!checkAuth(request)) { 
             return HttpResponse.json({ message: 'Sem token (mock)' }, { status: 401 });
         }
         return HttpResponse.json([...mockFeedbacksDb].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), { status: 200 });
    }),

    // GET /api/feedbacks/stats (Estatísticas - Admin)
    http.get(`${API_BASE_URL}/feedbacks/stats`, ({ request }) => {
         console.log("MSW: Interceptado GET /api/feedbacks/stats (admin)");
        if (!checkAuth(request)) {
             return HttpResponse.json({ message: 'Sem token (mock)' }, { status: 401 });
        }
         const total = mockFeedbacksDb.length;
         const pending = mockFeedbacksDb.filter(f => f.status === 'pendente').length;
         const approved = mockFeedbacksDb.filter(f => f.status === 'aprovado').length;
         const rejected = mockFeedbacksDb.filter(f => f.status === 'rejeitado').length;
         const stats: FeedbackStats = { total, pending, approved, rejected };
         return HttpResponse.json(stats, { status: 200 });
    }),

    // PATCH /api/feedbacks/:id/status (Atualizar Status - Admin)
    http.patch(`${API_BASE_URL}/feedbacks/:id/status`, async ({ request, params }) => {
        const { id } = params;
        const { status } = await request.json() as { status: FeedbackStatus };

        if (!checkAuth(request)) {
             return HttpResponse.json({ message: 'Sem token (mock)' }, { status: 401 });
        }

         const feedbackIndex = mockFeedbacksDb.findIndex(fb => fb._id === id);
         if (feedbackIndex === -1) {
             return HttpResponse.json({ message: 'Feedback não encontrado (mock)' }, { status: 404 });
         }
         const allowedStatuses: FeedbackStatus[] = ['aprovado', 'rejeitado'];
         if (!status || !allowedStatuses.includes(status)) {
              return HttpResponse.json({ message: 'Status inválido (mock)' }, { status: 400 });
         }

         mockFeedbacksDb[feedbackIndex] = { ...mockFeedbacksDb[feedbackIndex], status: status, updatedAt: new Date() };

         await delay(50); 
         return HttpResponse.json(mockFeedbacksDb[feedbackIndex], { status: 200 }); 
    }),

    // DELETE /api/feedbacks/:id (Deletar - Admin)
    http.delete(`${API_BASE_URL}/feedbacks/:id`, ({ request, params }) => {
         const { id } = params;

         if (!checkAuth(request)) {
             return HttpResponse.json({ message: 'Sem token (mock)' }, { status: 401 });
         }

         const initialLength = mockFeedbacksDb.length;
         mockFeedbacksDb = mockFeedbacksDb.filter(fb => fb._id !== id); 

         if (mockFeedbacksDb.length === initialLength) { 
             return HttpResponse.json({ message: 'Feedback não encontrado (mock)' }, { status: 404 });
         }
         return HttpResponse.json({ message: 'Feedback deletado com sucesso (mock)' }, { status: 200 });
    }),
];