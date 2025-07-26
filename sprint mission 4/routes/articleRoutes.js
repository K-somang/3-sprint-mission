import express from 'express';
import prisma from '../db.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// 루트 경로 (/) - 목록 조회, 게시글 등록
router.route('/')
  // 게시글 등록
  .post(
    auth.verifyAccessToken,
    async (req, res) => {
      const { userId } = req.user;
      try {
        const { title, content } = req.body;
        if (!title || !content) {
          return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
        }
        const article = await prisma.article.create({
          data: { title, content, user: { connect: { id: Number(userId) } } },
        });
        res.status(201).json(article);
      } catch (error) {
        console.error('게시글 등록 오류:', error);
        res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
      }
    })// 게시글 목록 조회
  .get(async (req, res) => {
    try {
      const { page = 1, limit = 10, search, sort } = req.query;
      const pageNumber = Math.max(1, Number(page) || 1);
      const limitNumber = Math.max(1, Math.min(100, Number(limit) || 10));
      const skip = (pageNumber - 1) * limitNumber;
      const where = search
        ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        }
        : {};
      const orderBy = sort === 'recent' ? { createdAt: 'desc' } : undefined;
      const articles = await prisma.article.findMany({
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true
        },
        where,
        skip,
        take: limitNumber,
        orderBy,
      });
      res.json(articles);
    } catch (error) {
      console.error('목록 조회 오류:', error);
      res.status(500).json({ error: '목록 조회 중 오류가 발생했습니다.' });
    }
  });

router.route('/:id')
  // 게시글 상세 조회
  .get(async (req, res) => {
    try {
      const { id } = req.params;
      const article = await prisma.article.findUnique({
        where: { id: Number(id) },
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

  // 게시글 수정
  .patch(
    auth.verifyAccessToken,
    auth.verifyArticleAuth,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { title, content } = req.body;          // 허용 필드만
        const updatedArticle = await prisma.article.update({
          where: { id: Number(id) },
          data: { title, content },
        });
        res.json(updatedArticle);
      } catch (error) {
        console.error('수정 오류:', error);
        res.status(500).json({ error: '수정 중 오류가 발생했습니다.' });
      }
    })

  // 게시글 삭제
  .delete(
    auth.verifyAccessToken,
    auth.verifyArticleAuth,
    async (req, res) => {
      try {
        const { id } = req.params;
        await prisma.article.delete({
          where: { id: Number(id) },
        });
        res.status(204).send();
      } catch (error) {
        console.error('삭제 오류:', error);
        res.status(500).json({ error: '삭제 중 오류가 발생했습니다.' });
      }
    });


export default router;
