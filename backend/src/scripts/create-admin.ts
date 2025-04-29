import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User'; 

dotenv.config();

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
    console.error('Erro: Forneça o nome de usuário e a senha como argumentos.');
    process.exit(1); 
}

const createAdmin = async () => {
    const dbUri = process.env.MONGO_URI; 

    if (!dbUri) {
        console.error('Erro: String de conexão MONGODB_URI não encontrada no .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(dbUri);

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.warn(`Aviso: Usuário "${username}" já existe.`);
            await mongoose.disconnect();
            process.exit(0); 
        }

        // Cria o usuário administrador
        console.log(`Criando usuário administrador "${username}"...`);
        const adminUser = new User({
            username,
            password, 
            role: 'adm' 
        });

        await adminUser.save(); 

        console.log(`Usuário administrador "${username}" criado com sucesso!`);

    } catch (error: any) {
        console.error('Erro ao criar administrador:', error.message);
        process.exit(1); 
    } finally {
        await mongoose.disconnect();
    }
};
createAdmin();