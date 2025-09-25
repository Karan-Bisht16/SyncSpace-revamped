import { Router } from 'express';
// importng middlewares
import { auth } from '../middlewares/auth.middleware.js';
// importng controllers
import { fetchInteractions } from '../controllers/interaction/view.interaction.controller.js';

const router = Router();

// GET
router.get('/fetchInteractions', auth, fetchInteractions);

export default router;