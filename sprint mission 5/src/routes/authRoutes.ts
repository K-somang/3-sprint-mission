import express from 'express';
import authController from '../controllers/authController.js'

const router = express.Router();

router.post('/', authController.createUser) // 회원가입 

router.post('/login', authController.login) // 로그인

export default router;

