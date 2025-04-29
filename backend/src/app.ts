import express from "express";
import cors from 'cors';
import feedbackRoutes from './routes/feedbackRoutes';
import authRoutes from './routes/authRoutes'; 

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/auth', authRoutes); 

export default app;