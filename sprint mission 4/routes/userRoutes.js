import express from 'express';
import auth from "../middlewares/auth.js";

import userController from '../controllers/userController.js';

const router = express.Router();

router.get('/', auth.verifyAccessToken, auth.UserInfoAuth, userController.UserInfo)



export default router;