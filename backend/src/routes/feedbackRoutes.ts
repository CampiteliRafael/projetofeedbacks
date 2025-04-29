import { Router } from "express";
import {
    getAllFeedbacks,
    createFeedback,
    deleteFeedback,
    updateFeedbackStatus,
    getFeedbackStats, 
    getMyFeedbacks   
} from "../controllers/feedbackController";

import { auth } from '../middleware/auth';

const router = Router();

router.get('/', auth('adm'), getAllFeedbacks);

router.post('/', auth(), createFeedback); 

router.delete('/:id', auth('adm'), deleteFeedback);

router.patch('/:id/status', auth('adm'), updateFeedbackStatus); 

router.get('/stats', auth('adm'), getFeedbackStats);

router.get('/my-feedbacks', auth(), getMyFeedbacks);

export default router;