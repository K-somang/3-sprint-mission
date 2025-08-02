import { RequestHandler } from "express";
import prisma from "../db.js";
import { createMarketCommentService, updateMarketCommentService, deleteMarketCommentService } from '../services/boardCommentService.js'

// 공통 유효성 검사 함수
const validateId = (id: string | number) => {
  const num = Number(id);
  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    throw new Error('유효하지 않은 ID 형식입니다');
  }
  return num;
};

const createBoardCommnet: RequestHandler = async (req, res, next) => {
  const articleId = parseInt(req.params.articleId, 10);
  if (isNaN(articleId)) {
    const err = new Error('유효하지 않은 ID입니다.');
    err.statusCode = 400;
    return next(err)
  };
  try {
    const { content, userId } = req.body;
    const comment = await createMarketCommentService({ userId, articleId, content })
    res.status(201).json({ message: "자유게시판 댓글이 성공적으로 등록되었습니다", data: comment });
  } catch (err) {
    console.error('댓글 등록 오류', err);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
    return next(err);
  }
}

// 자유게시판 댓글 수정
const updateBoardComment: RequestHandler = async (req, res, next) => {
  try {
    const commentId = validateId(req.params.commentId);

    if (!req.user || typeof req.user.id !== 'number') {
      return res.status(401).json({ error: '인증 정보가 없습니다.' });
    }
    const { content } = req.body;

    const updatedComment = await updateMarketCommentService({ commentId, content })
    res.status(200).json({ message: "자유게시판 댓글이 성공적으로 수정되었습니다", data: updatedComment });
  } catch (err) {
    console.error('댓글 등록 오류', err);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
    return next(err);
  }
};

// 자유게시판 댓글 삭제
const deleteBoardComment: RequestHandler = async (req, res, next) => {
  try {
    const commentId = validateId(req.params.commentId);

    const deleteComment = await deleteMarketCommentService({ commentId });
    res.status(200).send({ message: '자유게시판 댓글이 성공적으로 삭제되었습니다', deleteComment });

  } catch (err) {
    console.error('댓글 삭제 오류:', err);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
  }
}

export default {
  createBoardCommnet,
  updateBoardComment,
  deleteBoardComment,

}