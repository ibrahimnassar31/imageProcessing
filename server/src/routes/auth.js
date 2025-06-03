import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import validate, { schemas } from '../middlewares/validate.js';

const router = express.Router();

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/logout', logout);

export default router;