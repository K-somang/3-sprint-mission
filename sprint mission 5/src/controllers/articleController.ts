import { RequestHandler } from 'express'
import { Prisma, PrismaClient } from '@prisma/client';
import { createArticleService, updateArticleService, deleteArticleService } from '../services/articleService.js';

const prisma = new PrismaClient();

// ID 검증 헬퍼 함수
const validateId = (articleId: string | number) => {
  const num = Number(articleId);
  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    throw new Error('유효하지 않은 ID');
  }
  return num;
}

// 게시글 등록
const createArticle: RequestHandler = async (req, res, next) => {
  if (!req.user || typeof req.user.id !== 'number') {
    return res.status(401).json({ error: '인증 정보가 없습니다.' });
  }
  const userId = req.user.id;
  try {
    const { title, content } = req.body;
    const article = await createArticleService({ title, content, userId })
    res.status(201).json({ message: '게시글 등록 완료', article });
  } catch (err) {
    console.error('게시글 등록 오류:', err);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
  }
};

// 게시글 수정
const updateArticle: RequestHandler = async (req, res, next) => {
  try {
    const articleId = validateId(req.params.articleId);
    const { title, content } = req.body;
    if (!req.user || typeof req.user.id !== 'number') {
      return res.status(401).json({ error: '인증 정보가 없습니다.' });
    }
    const userId = req.user.id;
    const updateArticle = await updateArticleService({ articleId, title, content, userId });

    res.status(200).json({ message: '게시글 수정 완료', updateArticle });
  } catch (err) {
    console.error('수정 오류:', err);
    res.status(500).json({ error: '수정 중 오류가 발생했습니다.' });
  }
};

// 게시글 삭제
const deleteArticle: RequestHandler = async (req, res, next) => {
  try {
    const articleId = validateId(req.params.articleId);
    if (!req.user || typeof req.user.id !== 'number') {
      return res.status(401).json({ error: '인증 정보가 없습니다.' });
    }
    const deleteArticle = await deleteArticleService({ articleId });

    res.status(200).json({ message: '게시글 삭제 완료', deleteArticle });
  } catch (err) {
    console.error('삭제 오류:', err);
    res.status(500).json({ error: '삭제 중 오류가 발생했습니다.' });
  }
};
// 게시글 상세 조회
export const getArticle: RequestHandler = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    if (!id) return res.status(400).json(id);

    const article = await prisma.article.findUnique({
      where: { id: id }
    });

    if (!article) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    res.status(200).json(article);
  } catch (err) {
    next(err);
  }
};

// 게시글 목록 조회
export const getArticles: RequestHandler = async (req, res, next) => {
  try {
    const { search = '', order = 'desc' } = req.query;
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    function toString(value: unknown): string | undefined {
      if (typeof value === 'string') return value;
      if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
      return undefined;
    }

    const searchStr = toString(search);

    const where: Prisma.ArticleWhereInput = searchStr ? {
      OR: [
        { title: { contains: searchStr, mode: 'insensitive' } },
        { content: { contains: searchStr, mode: 'insensitive' } },
      ],
    } : {};

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: order === 'asc' ? 'asc' : 'desc' },
        select: { id: true, title: true, createdAt: true },
      }),
      prisma.article.count({ where })
    ]);

    res.status(200).json({
      data: articles,
      pagination: { total, offset, limit }
    });
  } catch (err) {
    next(err);
  }
};

export default {
  createArticle,
  updateArticle,
  deleteArticle,
}