// routes/upload.js
import express from 'express';
import upload from '../middlewares/upload.js';
import { uploadImage } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/', upload.single('image'), uploadImage); // 'image'는 form-data의 필드 이름
export default router;
