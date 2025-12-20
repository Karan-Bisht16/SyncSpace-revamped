import { Router } from 'express';
// importng controllers
import { decodeToken } from '../controllers/token/lifecycle.token.controller.js';

const router = Router();

// POST
router.post('/decodeToken', decodeToken);

export default router;