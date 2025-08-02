import express from 'express';
import prisma from '../db.js';
import auth from '../middlewares/authMiddleware.js';
import { Prisma } from '@prisma/client';
import articleController from '../controllers/articleController.js';
import validate, { articleSchema } from '../middlewares/validation.js';

const router = express.Router();

// 루트 경로 (/) - 목록 조회, 게시글 등록
router.route('/')
  // 게시글 등록
  .post(
    auth.verifyAccessToken,
    validate(articleSchema),
    articleController.createArticle,
  )

router.route('/:articleId')
  // 게시글 수정
  .patch(
    auth.verifyAccessToken,
    auth.verifyArticleAuth,
    validate(articleSchema),
    articleController.updateArticle,
  )

  // 게시글 삭제
  .delete(
    auth.verifyAccessToken,
    auth.verifyArticleAuth,
    articleController.deleteArticle,
  )


  // 게시글 목록 조회
  .get(async (req, res) => {
    try {
      const { page = '1', limit = '10', search, sort } = req.query;
      const pageNumber = Math.max(1, Number(page) || 1);
      const limitNumber = Math.max(1, Math.min(100, Number(limit) || 10));
      const skip = (pageNumber - 1) * limitNumber;
      function toString(value: unknown): string | undefined {
        if (typeof value === 'string') return value;
        if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
        return undefined;
      }

      const searchStr = toString(search);
      const where = searchStr
        ? {
          OR: [
            { title: { contains: searchStr, mode: Prisma.QueryMode.insensitive } },
            { content: { contains: searchStr, mode: Prisma.QueryMode.insensitive } },
          ],
        }
        : {};
      const orderBy = sort === 'recent'
        ? { createdAt: Prisma.SortOrder.desc }
        : { createdAt: Prisma.SortOrder.asc };

      const articles = await prisma.article.findMany({
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
        },
        where,
        skip,
        take: limitNumber,
        orderBy
      });
      res.json(articles);
    } catch (error) {
      console.error('목록 조회 오류:', error);
      res.status(500).json({ error: '목록 조회 중 오류가 발생했습니다.' });
    }
  });

router.route('/:articleId')
  // 게시글 상세 조회
  .get(async (req, res) => {
    try {
      const { articleId } = req.params;
      const article = await prisma.article.findUnique({
        where: { id: Number(articleId) },
      });
      if (!article) {
        return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
      }
      res.json(article);
    } catch (error) {
      console.error('상세 조회 오류:', error);
      res.status(500).json({ error: '상세 조회 중 오류가 발생했습니다.' });
    }
  })

export default router;
