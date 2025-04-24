import { useState } from "react";
import { sendFeedback } from "../api/feedbackService";
import { Feedback } from "../types/Feedback";

interface Props {
    onSent: () => void;
}

export default function FeedbackForm({ onSent }: Props) {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const feedback: Feedback = { name, message };
        await sendFeedback(feedback);
        setName('');
        setMessage('');
        onSent();
    };


    return (
        <form onSubmit={handleSubmit}>

            <h2>Enviar Feedback</h2>
            <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
            <textarea placeholder="Mensagem" value={message}
            onChange={(e) => setMessage(e.target.value)} required />
            <button type="submit">Enviar</button>

        </form>
    );
}