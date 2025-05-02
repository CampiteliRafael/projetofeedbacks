import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
export interface IUser extends Document {
    username: string;
    password: string;
    role: 'adm' | 'user'; 
    comparePassword(enteredPassword: string): Promise<boolean>; 
}

const userSchema = new Schema<IUser>({ 
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['adm', 'user'], default: 'user' },
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(enteredPassword: string): Promise<boolean> {
    return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema); 