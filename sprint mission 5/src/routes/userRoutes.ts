import express from 'express';
import auth from "../middlewares/authMiddleware.js";
import userController from '../controllers/userController.js';

const router = express.Router();

router.get('/', auth.verifyAccessToken, userController.UserInfo)

router.patch('/:userId', auth.verifyAccessToken, auth.UserInfoAuth, userController.updateUserInfo)

router.patch('/updatePassword/:userId', auth.verifyAccessToken, auth.UserInfoAuth, userController.updatePasswordInfo)

router.get('/ProductInfo', auth.verifyAccessToken, userController.ProductInfo)

export default router;