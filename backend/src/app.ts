import express from "express";
import cors from 'cors';
import feedbackRoutes from './routes/feedbackRoutes';
import authRoutes from './routes/authRoutes'; // Importe as rotas de autenticação

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/auth', authRoutes); // Use as rotas de autenticação

export default app;