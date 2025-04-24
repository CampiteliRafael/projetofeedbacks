import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({
    name: { type: String, required: true },
    message: { type: String, required: true },
},
    { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);
