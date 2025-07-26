import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

// images 디렉토리 생성 (없을 경우)
const uploadDir = path.resolve(process.cwd(), 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // 절대 경로 사용
  },
  filename: (req, file, cb) => {
    // 암호학적으로 안전한 파일명 생성
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// 파일 필터: 이미지 파일만 허용
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('허용되지 않는 파일 형식입니다. 이미지 파일만 업로드 가능합니다.'), false);
  }
};

// 업로드 설정
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
    files: 5 // 최대 5개 파일
  }
});

export default upload;
