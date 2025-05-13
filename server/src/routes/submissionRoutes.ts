import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { submitForm, getSubmissions } from '../controllers/submissionController';

const router = Router();

// Public route for form submission
router.post('/:form_id', submitForm);

// Protected routes for viewing submissions
router.use(authenticateUser);
router.get('/:form_id', getSubmissions);

export default router; 