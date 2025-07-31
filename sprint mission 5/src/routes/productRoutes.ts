import express from 'express';
import prisma from '../db.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

// 루트 경로 (/) - 목록 조회, 상품 등록
router.route('/')
  // 상품 등록 로직
  .post(
    auth.verifyAccessToken,
    async (req, res, next) => {
      if (!req.user || typeof req.user.id !== 'number') {
        return res.status(401).json({ error: '인증 정보가 없습니다.' });
      }
      const userId = req.user.id;

      try {
        const { name, description, price, tags } = req.body;

        if (!name || !description) {
          return res.status(400).json({
            error: '이름과 설명은 필수 입력 사항입니다.'
          });
        }

        if (Number(price) === undefined || Number(price) === null || Number(price) < 0) {
          return res.status(400).json({ error: '상품 가격은 0 이상이어야 합니다.' });
        }

        if (typeof Number(price) !== 'number') {
          return res.status(400).json({
            error: '가격은 숫자이어야 합니다.'
          });
        }

        const product = await prisma.product.create({
          data: {
            name, description, price, tags, user: { connect: { id: Number(userId) } },
          },
        });

        res.status(201).json(product);
      } catch (error) {
        console.error('상품 등록 오류:', error);
        res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
        return next(error);
      }
    })

  // 상품 목록 조회 로직
  .get(async (req, res) => {
    try {
      const { page = 1, limit = 10, sort } = req.query;

      const pageNumber = Math.max(1, Number(page) || 1);
      const limitNumber = Math.max(1, Math.min(100, Number(limit) || 10));
      const skip = (pageNumber - 1) * limitNumber;

      let searchStr: string | undefined;
      if (typeof req.query.search === 'string') {
        searchStr = req.query.search;
      } else if (
        Array.isArray(req.query.search) &&
        req.query.search.length > 0 &&
        typeof req.query.search[0] === 'string'
      ) {
        searchStr = req.query.search[0];
      }

      const where = searchStr
        ? {
          OR: [
            { name: { contains: searchStr, mode: "insensitive" as const } },
            { description: { contains: searchStr, mode: "insensitive" as const } },
          ],
        }
        : undefined;

      const orderBy = sort === 'recent' ? { createdAt: 'desc' as const } : undefined;

      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          price: true,
          createdAt: true,
        },
        where,
        skip,
        take: limitNumber,
        orderBy,
      });

      res.json(products);
    } catch (error) {
      console.error('목록 조회 오류:', error);
      res.status(500).json({ error: '목록 조회 중 오류가 발생했습니다.' });
    }
  });

// ID 경로 (/:id) - 상세 조회, 수정, 삭제
router.route('/:id')
  // 상품 상세 조회 로직
  .get(async (req, res) => {
    try {
      const { id } = req.params;
      const product = await prisma.product.findUnique({
        where: { id: Number(id) },
      });

      if (!product) {
        return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
      }

      res.json(product);
    } catch (error) {
      console.error('상품 상세 조회 오류:', error);
      res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
    }
  });

router.route('/:productId')
  // 상품 수정 로직
  .patch(
    auth.verifyAccessToken,
    auth.verifyProductAuth,
    async (req, res) => {
      try {
        const { productId } = req.params;
        const { name, description, price, tags } = req.body;
        const data = { name, description, price, tags };

        const updatedProduct = await prisma.product.update({
          where: { id: Number(productId) },
          data,
        });

        res.json(updatedProduct);
      } catch (error) {
        console.error('상품 수정 오류:', error);
        res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
      }
    })
  .delete(
    auth.verifyAccessToken,
    auth.verifyProductAuth,
    async (req, res) => {
      // 상품 삭제 로직
      try {
        const { productId } = req.params;
        const deletedProduct = await prisma.product.delete({
          where: { id: Number(productId) },
        });

        res.status(204).json(deletedProduct);
      } catch (error) {
        console.error('상품 삭제 오류:', error);
        res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
      }
    });

export default router;
