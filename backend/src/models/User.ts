import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface para o documento User
interface IUser extends Document {
    username: string;
    password: string;
    role: 'adm' | 'user'; // Use tipos literais para as roles
    comparePassword(enteredPassword: string): Promise<boolean>; // Adicione a assinatura do método
}

const userSchema = new Schema<IUser>({ // Use a interface IUser aqui
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['adm', 'user'], default: 'user' },
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(enteredPassword: string): Promise<boolean> {
    return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema); // Use a interface IUser aqui