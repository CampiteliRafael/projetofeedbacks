import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User'; // Ajuste o caminho para o seu modelo User

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Argumentos da linha de comando (Ex: node dist/scripts/create-admin.js adminuser password123)
const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
    console.error('Erro: Forneça o nome de usuário e a senha como argumentos.');
    console.log('Uso: node dist/utils/create-admin.js <username> <password>');
    process.exit(1); // Sai com código de erro
}

const createAdmin = async () => {
    const dbUri = process.env.MONGO_URI; // Certifique-se que MONGODB_URI está no seu .env

    if (!dbUri) {
        console.error('Erro: String de conexão MONGODB_URI não encontrada no .env');
        process.exit(1);
    }

    try {
        console.log('Conectando ao banco de dados...');
        await mongoose.connect(dbUri);
        console.log('Conectado com sucesso.');

        // Verifica se o usuário já existe
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.warn(`Aviso: Usuário "${username}" já existe.`);
            await mongoose.disconnect();
            process.exit(0); // Sai sem erro, pois o usuário já existe
        }

        // Cria o usuário administrador
        console.log(`Criando usuário administrador "${username}"...`);
        const adminUser = new User({
            username,
            password, // O hook pre-save no User.ts vai hashear isso
            role: 'adm' // Define explicitamente a role como 'adm'
        });

        await adminUser.save(); // O hook pre-save será executado aqui

        console.log(`Usuário administrador "${username}" criado com sucesso!`);

    } catch (error: any) {
        console.error('Erro ao criar administrador:', error.message);
        process.exit(1); // Sai com código de erro
    } finally {
        // Garante que a conexão com o banco de dados seja fechada
        console.log('Desconectando do banco de dados...');
        await mongoose.disconnect();
        console.log('Desconectado.');
    }
};

createAdmin();