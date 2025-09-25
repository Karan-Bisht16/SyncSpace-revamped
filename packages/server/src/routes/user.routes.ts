import { Router } from 'express';
// importng middlewares
import { auth } from '../middlewares/auth.middleware.js';
import { requireReauth } from '../middlewares/requireReauth.middleware.js';
// importng controllers
import {
    deleteAccount,
    resetSetting,
    updateSetting,
} from '../controllers/user/account.user.controller.js';
import {
    changePassword,
    decodeUpdateEmailToken,
    decodeVerifyEmailToken,
    initiateEmailUpdation,
    initiateEmailVerification,
    updateEmail,
    verifyEmail,
} from '../controllers/user/profile.user.controller.js';
import {
    determineReauth,
    fetchSession,
} from '../controllers/user/session.user.controller.js';

const router = Router();

// GET
router.get('/fetchSession', auth, fetchSession);
router.get('/determineReauth', auth, requireReauth, determineReauth);

// POST
router.post('/initiateEmailUpdation', auth, requireReauth, initiateEmailUpdation);
router.post('/decodeUpdateEmailToken', decodeUpdateEmailToken);
router.post('/initiateEmailVerification', auth, requireReauth, initiateEmailVerification);
router.post('/decodeVerifyEmailToken', decodeVerifyEmailToken);

// PATCH
router.patch('/updateEmail', updateEmail);
router.patch('/verifyEmail', verifyEmail);
router.patch('/updateSetting', auth, updateSetting);
router.patch('/resetSetting', auth, resetSetting);
router.patch('/changePassword', auth, requireReauth, changePassword);

// DELETE
router.delete('/deleteAccount', auth, requireReauth, deleteAccount);

export default router;