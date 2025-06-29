export const uploadImage = (req, res) => {
  try {
    // 1. 파일 존재 여부 확인
    if (!req.file) {
      return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }

    // 2. MIME 타입 검증 (이미지 파일만 허용)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];
    
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        message: '허용되지 않는 파일 형식입니다. 이미지 파일만 업로드 가능합니다.',
        allowedTypes: allowedMimeTypes
      });
    }

    // 3. 안전한 파일 경로 생성
    const imagePath = `/images/${req.file.filename}`;
    
    // 4. 응답 데이터 확장
    res.status(201).json({ 
      message: '이미지 업로드 성공',
      imagePath,
      fileInfo: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.filename
      }
    });
  } catch (err) {
    // 5. 일관된 에러 처리
    console.error('이미지 업로드 오류:', err);
    res.status(500).json({ 
      message: '이미지 업로드 처리 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  }
};
