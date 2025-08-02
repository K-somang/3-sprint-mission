import { RequestHandler } from "express";
import prisma from "../db.js";
import { CustomError } from '../middlewares/errorHandler.js';
import { createMarketCommentService, deleteMarketCommentService, updateMarketCommentService } from "../services/marketCommentService.js";

// 공통 유효성 검사 함수
const validateId = (id: string | number) => {
  const num = Number(id);
  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    throw new Error('유효하지 않은 ID 형식입니다');
  }
  return num;
};

// 중고시장 댓글 등록
const createMarketComment: RequestHandler = async (req, res, next) => {
  const productId = parseInt(req.params.productId, 10);
  if (isNaN(productId)) {
    const err = new Error('유효하지 않은 ID입니다.');
    err.statusCode = 400;
    return next(err)
  };
  try {
    const { userId, content } = req.body;
    const comment = await createMarketCommentService({ userId, productId, content })
    res.status(201).json({
      message: '중고마켓 댓글이 성공적으로 등록되었습니다!',
      comment: comment
    });
  } catch (err) {
    console.error('댓글 등록 오류', err);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
    return next(err);
  }
}

// 중고시장 댓글 수정
const updateMarketComment: RequestHandler = async (req, res, next) => {
  try {
    const commentId = validateId(req.params.commentId);
    const { content } = req.body;
    if (!req.user || typeof req.user.id !== 'number') {
      return res.status(401).json({ error: '인증 정보가 없습니다.' });
    }
    const updatedComment = await updateMarketCommentService({ commentId, content });

    res.status(200).json({ message: '중고마켓 댓글이 성공적으로 수정되었습니다!', updatedComment });

  } catch (err) {
    console.error('댓글 수정 오류:', err);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
  }
}

// 중고시장 댓글 삭제
const deleteMarketComment: RequestHandler = async (req, res, next) => {
  try {
    const commentId = validateId(req.params.commentId);
    if (!req.user || typeof req.user.id !== 'number') {
      return res.status(401).json({ error: '인증 정보가 없습니다.' });
    }
    const deleteComment = await deleteMarketCommentService({ commentId });

    res.status(200).send({ message: '상품 삭제 완료', deleteComment });
  } catch (err) {
    console.error('댓글 수정 오류:', err);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
  }
}

export default {
  createMarketComment,
  updateMarketComment,
  deleteMarketComment
}