import express from 'express';
import registerController from '../controllers/registerController.js'

const router = express.Router();

router.post('/', registerController.createUser) // 회원가입 

router.post('/login', registerController.login) // 로그인

export default router;

