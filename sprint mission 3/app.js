import express from 'express';
import cors from 'cors';

// 에러 핸들러
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// 라우터
import productRoutes from './routes/productRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import usedMarketCommentRoutes from './routes/usedMarketCommentRoutes.js';
import freeBoardCommentRoutes from './routes/freeBoardCommentRoutes.js';

// 미들웨어
import upload from './middlewares/upload.js';

// 환경 변수
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 미들웨어 설정
app.use(express.json());
app.use(cors());
app.use('/images', express.static('images')); // 단일 정적 파일 경로

// 이미지 업로드 엔드포인트
app.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }

    // MIME 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: '허용되지 않는 파일 형식입니다' });
    }

    const imageUrl = `/images/${req.file.filename}`;
    res.status(201).json({ 
      message: '이미지 업로드 성공', 
      imagePath: imageUrl,
      fileInfo: {
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (err) {
    console.error('업로드 오류:', err);
    res.status(500).json({ message: '서버 내부 오류' });
  }
});

// 라우트 설정 (RESTful 스타일)
app.use('/products', productRoutes); // 중고시장
app.use('/articles', articleRoutes); // 자유게시판
app.use('/products/comments', usedMarketCommentRoutes); // 중고시장 댓글
app.use('/articles/comments', freeBoardCommentRoutes); // 자유게시판 댓글

// 에러 핸들러
app.use(notFoundHandler);
app.use(errorHandler);

// 서버 시작
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
