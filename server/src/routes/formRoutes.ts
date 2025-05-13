import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import {
  createForm,
  getForms,
  getForm,
  updateForm,
  deleteForm,
} from '../controllers/formController';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Form routes
router.post('/', createForm);
router.get('/', getForms);
router.get('/:id', getForm);
router.put('/:id', updateForm);
router.delete('/:id', deleteForm);

export default router; 