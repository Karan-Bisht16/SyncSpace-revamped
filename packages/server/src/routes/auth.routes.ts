import { Router } from 'express';
import { sharedConfig } from '@syncspace/shared';
// importng middlewares
import { auth } from '../middlewares/auth.middleware.js';
// importng utils
import { fileUploadHandler } from '../utils/fileUploadHandler.util.js';
// importng controllers
import {
    login,
    loginViaFacebook,
    loginViaGoogle,
    logout,
    reauth,
    refresh,
    register,
    registerViaFacebook,
    registerViaGoogle,
} from '../controllers/auth/lifecycle.auth.controller.js';
import {
    isEmailAvailable,
    isUsernameAvailable,
} from '../controllers/auth/availability.auth.controller.js';
import {
    forgotPassword,
    resetPassword,
} from '../controllers/auth/recovery.auth.controller.js';

const { maxProfilePicSizeMB } = sharedConfig;

const router = Router();

// GET
router.get('/isEmailAvailable', isEmailAvailable);
router.get('/isUsernameAvailable', isUsernameAvailable);

// POST
router.post('/register', ...fileUploadHandler({ sizeLimitMB: maxProfilePicSizeMB, fieldName: 'profilePic', single: true }), register);
router.post('/login', login);
router.post('/registerViaGoogle', registerViaGoogle);
router.post('/loginViaGoogle', loginViaGoogle);
router.post('/registerViaFacebook', registerViaFacebook);
router.post('/loginViaFacebook', loginViaFacebook);
router.post('/refresh', refresh);
router.post('/reauth', auth, reauth);
router.post('/forgotPassword', forgotPassword);

// PATCH
router.patch('/resetPassword', resetPassword);

// DELETE
router.delete('/logout', auth, logout);

export default router;