import express from 'express';
import prisma from '../prisma/prisma.js';
import { validate, commentSchema } from '../middlewares/validation.js';
import { CustomError, errorHandler } from '../middlewares/errorHandler.js';
import marketCommentController from '../controllers/marketCommentController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

// 중고마켓 댓글 등록 API
router.post('/:productId/comments',
    auth.verifyAccessToken,
    validate(commentSchema),
    marketCommentController.createMarketComment
);

// 중고마켓 댓글 수정 API
router.patch('/:productId/comments/:commentId',
    auth.verifyAccessToken,
    auth.verifyProductCommentAuth,
    validate(commentSchema),
    marketCommentController.updateMarketComment
);

// 중고마켓 댓글 삭제 API
router.delete('/:productId/comments/:commentId',
    auth.verifyAccessToken,
    auth.verifyProductCommentAuth,
    marketCommentController.deleteMarketComment
);

// 중고마켓 댓글 목록 조회 API
router.get('/', async (req, res, next) => {
    try {
        const productId = Number(req.query.productId);
        const { cursor, limit = '10' } = req.query;

        // limit 안전하게 파싱
        let limitStr: string;
        if (typeof limit === 'string') {
            limitStr = limit;
        } else if (Array.isArray(limit) && typeof limit[0] === 'string') {
            limitStr = limit[0];
        } else {
            limitStr = '10';
        }
        const parsedLimit = parseInt(limitStr, 10);
        if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
            return next(new CustomError('limit은 1에서 100 사이의 유효한 숫자여야 합니다.', 400));
        }

        // 상품 존재 확인
        const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
        if (!existingProduct) {
            return next(new CustomError('상품을 찾을 수 없습니다.', 404));
        }

        let cursorObj: { id: number } | undefined = undefined;
        if (cursor) {
            if (typeof cursor === 'string' && !isNaN(Number(cursor))) {
                cursorObj = { id: Number(cursor) };
            } else if (Array.isArray(cursor) && cursor.length > 0 && typeof cursor[0] === 'string' && !isNaN(Number(cursor[0]))) {
                cursorObj = { id: Number(cursor[0]) };
            }
        }

        const comments = await prisma.productComment.findMany({
            where: { productId },
            take: parsedLimit + 1,
            ...(cursorObj && {
                skip: 1,
                cursor: cursorObj,
            }),
            orderBy: {
                createdAt: 'desc' as const,
            },
            select: {
                id: true,
                content: true,
                createdAt: true,
            },
        });

        let nextCursor = null;
        let hasNextPage = false;

        if (comments.length > parsedLimit) {
            hasNextPage = true;
            comments.pop(); // 초과로 가져온 1개 제거
            nextCursor = comments.length > 0 ? comments[comments.length - 1].id : null
        }

        res.status(200).json({
            data: comments,
            pagination: {
                next_cursor: nextCursor,
                has_next_page: hasNextPage,
                limit: parsedLimit
            }
        });

    } catch (err) {
        next(err);
    }
});

export default router;