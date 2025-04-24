import { connectDB } from "./config/db";
import app from "./app";
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
})