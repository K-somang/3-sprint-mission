import { expressjwt } from 'express-jwt';
import jwt from 'jsonwebtoken';
import { RequestHandler } from 'express'

import authRepository from '../repositories/authRepository.js';
import { ExtendedError } from '../types/express/index.js';
import type { JwtPayload } from 'jsonwebtoken';

const verifyAccessToken = expressjwt({
  secret: process.env.JWT_SECRET!,
  algorithms: ['HS256'],
  requestProperty: 'user'
});

const verifyProductAuth: RequestHandler = async (req, res, next) => {
  const userId = req.params.productId;
  try {
    const ProductInfo = await authRepository.getByProductId(userId);

    if (!ProductInfo) {
      return res.status(404).json({ message: 'ProductInfo not found' })
    }

    if (!req.user || ProductInfo.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

const verifyArticleAuth: RequestHandler = async (req, res, next) => {
  const userId = req.params.articleId;
  try {
    const ArticleInfo = await authRepository.getByArticleId(userId);

    if (!ArticleInfo) {
      return res.status(404).json({ message: 'ArticleInfo not found' })

    }
    if (!req.user || ArticleInfo.userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' })

    }

    return next();
  } catch (error) {
    return next(error);
  }
}

const verifyProductCommentAuth: RequestHandler = async (req, res, next) => {
  const userId = req.params.commentId;
  try {
    const ProductCommentInfo = await authRepository.getByProductCommentId(userId);

    if (!ProductCommentInfo) {
      const error = new Error('ProductCommentInfo not found') as ExtendedError;
      error.code = 404;
      throw error;
    }
    if (ProductCommentInfo.userId !== req.user?.id) {
      const error = new Error('Forbidden') as ExtendedError;
      error.code = 403;
      throw error;
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

const verifyArticleCommentAuth: RequestHandler = async (req, res, next) => {
  const userId = req.params.commentId;
  try {
    const ArticleCommentInfo = await authRepository.getByArticleCommentId(userId);

    if (!ArticleCommentInfo) {
      const error = new Error('ArticleCommentInfo not found') as ExtendedError;
      error.code = 404;
      throw error;
    }
    if (ArticleCommentInfo.userId !== req.user!.id) {
      const error = new Error('Forbidden') as ExtendedError;
      error.code = 403;
      throw error;
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

const userAuth: RequestHandler = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer 토큰

  if (!token) return res.status(401).json({ message: '인증 토큰이 필요합니다.' });

  try {
    interface CustomJwtPayload extends JwtPayload {
      id: number;
      email: string;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload | string;

    if (typeof decoded === 'string') {
      return res.status(401).json({ message: '유효하지 않은 토큰 페이로드입니다.' });
    }

    if (!decoded.id) {
      return res.status(401).json({ message: '토큰에 유저 ID가 존재하지 않습니다.' });
    }

    req.user = decoded;
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
  userAuth,
}

