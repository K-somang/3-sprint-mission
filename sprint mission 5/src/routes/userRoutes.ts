import express from 'express';
import auth from "../middlewares/authMiddleware.js";
import userController from '../controllers/userController.js';

const router = express.Router();

router.get('/', auth.verifyAccessToken, userController.user)

router.patch('/:userId', auth.verifyAccessToken, auth.userAuth, userController.updateUser)

router.patch('/updatePassword/:userId', auth.verifyAccessToken, auth.userAuth, userController.updatePassword)

router.get('/products/:productId', auth.verifyAccessToken, userController.product)

export default router;