import { expressjwt } from 'express-jwt';
import jwt from 'jsonwebtoken';

import registerRepository from '../repositories/registerRepository.js';

const verifyAccessToken = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'user'
});

async function verifyProductAuth(req, res, next) {
  const userId = req.params.productId;
  try {
    const ProductInfo = await registerRepository.getByProductId(userId);

    if (!ProductInfo) {
      const error = new Error('ProductInfo not found');
      error.code = 404;
      throw error;
    }
    if (ProductInfo.userId !== req.user.id) {
      const error = new Error('Forbidden');
      error.code = 403;
      throw error;
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

async function verifyArticleAuth(req, res, next) {
  const userId = req.params.id;
  try {
    const ArticleInfo = await registerRepository.getByArticleId(userId);

    if (!ArticleInfo) {
      const error = new Error('ArticleInfo not found');
      error.code = 404;
      throw error;
    }
    if (ArticleInfo.id !== req.user.userId) {
      const error = new Error('Forbidden');
      error.code = 403;
      throw error;
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

async function verifyProductCommentAuth(req, res, next) {
  const userId = req.params.commentId;
  try {
    const ProductCommentInfo = await registerRepository.getByProductCommentId(userId);

    if (!ProductCommentInfo) {
      const error = new Error('ProductCommentInfo not found');
      error.code = 404;
      throw error;
    }
    if (ProductCommentInfo.id !== req.user.userId) {
      const error = new Error('Forbidden');
      error.code = 403;
      throw error;
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

async function verifyArticleCommentAuth(req, res, next) {
  const userId = req.params.commentId;
  try {
    const ArticleCommentInfo = await registerRepository.getByArticleCommentId(userId);

    if (!ArticleCommentInfo) {
      const error = new Error('ArticleCommentInfo not found');
      error.code = 404;
      throw error;
    }
    if (ArticleCommentInfo.id !== req.user.userId) {
      const error = new Error('Forbidden');
      error.code = 403;
      throw error;
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

async function UserInfoAuth(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer 토큰

  if (!token) return res.status(401).json({ message: '인증 토큰이 필요합니다.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT_SECRET:', process.env.JWT_SECRET); 

    if (!decoded.id) {
      return res.status(401).json({ message: '토큰에 유저 ID가 존재하지 않습니다.' });
    }
    req.user = decoded; // payload에서 유저 정보 저장
    next();
  } catch (err) {
    res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
}


export default {
  verifyAccessToken,
  verifyProductAuth,
  verifyArticleAuth,
  verifyProductCommentAuth,
  verifyArticleCommentAuth,
  UserInfoAuth,
}

