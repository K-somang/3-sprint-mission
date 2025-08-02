import { RequestHandler } from 'express'
import { Prisma, PrismaClient } from '@prisma/client';
import { Request, ParamsDictionary, Response } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
const prisma = new PrismaClient();

// 공통 유효성 검사 함수
const validateId = (id: string | number) => {
  const num = Number(id);
  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    throw new Error('유효하지 않은 ID 형식입니다');
  }
  return num;
};

// 공통 댓글 생성 함수
type ParentType = 'product' | 'article';

const createComment = async (
  parentType: ParentType,
  parentId: string | number,
  content: string,
  userId: number,
) => {
  const parsedParentId = Number(parentId);
  if (isNaN(parsedParentId)) {
    throw new Error('유효하지 않은 ID입니다.');
  }

  if (parentType === 'product') {
    const parentExists = await prisma.product.findUnique({
      where: { id: parsedParentId },
    });

    if (!parentExists) {
      throw new Error('상품을 찾을 수 없습니다');
    }

    return prisma.productComment.create({
      data: {
        content,
        productId: parsedParentId,
        userId,
      },
    });
  } else if (parentType === 'article') {
    const parentExists = await prisma.article.findUnique({
      where: { id: parsedParentId },
    });

    if (!parentExists) {
      throw new Error('게시글을 찾을 수 없습니다');
    }

    return prisma.articleComment.create({
      data: {
        content,
        articleId: parsedParentId,
        userId,
      },
    });
  } else {
    throw new Error('알 수 없는 parentType입니다');
  }
};



// 중고마켓 댓글 등록
export const createProductComment: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "로그인이 필요합니다." });

    const productId = validateId(req.params.productId);
    const { content } = req.body;

    if (!content || content.trim().length < 2) {
      return res.status(400).json({ message: '댓글 내용은 2자 이상이어야 합니다' });
    }

    const comment = await createComment('product', productId, content, userId);
    res.status(201).json({ message: '댓글 등록 완료', comment });
  } catch (err) {
    next(err);
  }
};

// 자유게시판 댓글 등록
export const createArticleComment: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "로그인이 필요합니다." });

    const articleId = validateId(req.params.articleId);
    const { content } = req.body;

    if (!content || content.trim().length < 2) {
      return res.status(400).json({ message: '댓글 내용은 2자 이상이어야 합니다' });
    }

    const comment = await createComment('article', articleId, content, userId);
    res.status(201).json({ message: '댓글 등록 완료', comment });
  } catch (err) {
    next(err);
  }
};

// 댓글 수정
export const updateComment: RequestHandler = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    const { content } = req.body;

    if (!content || content.trim().length < 2) {
      return res.status(400).json({ message: '댓글 내용은 2자 이상이어야 합니다' });
    }

    // 댓글 존재 여부 확인
    const existing = await prisma.articleComment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다' });
    }

    const comment = await prisma.articleComment.update({
      where: { id },
      data: { content },
    });
    res.status(200).json({ message: '댓글 수정 완료', comment });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다' });
    }
    next(err);
  }
};

// 댓글 삭제
export const deleteComment: RequestHandler = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);

    // 댓글 존재 여부 확인
    const existing = await prisma.articleComment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다' });
    }

    await prisma.articleComment.delete({ where: { id } });
    res.status(200).json({ message: '댓글 삭제 완료' });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다' });
    }
    next(err);
  }
};

