// src/routes/productRoutes.js (또는 src/routes/usedMarketCommentRoutes.js)

import express from 'express';
// PrismaClient 인스턴스를 가져옵니다.
import prisma from '../prisma/prisma.js';
// 유효성 검증 미들웨어 (JavaScript 파일로 존재해야 함)
import { validate, commentSchema } from '../middlewares/validation.js';
// 커스텀 에러 핸들러 (JavaScript 파일로 존재해야 함)
import { errorHandler } from '../middlewares/errorHandler.js';

import auth from '../middlewares/auth.js';

const router = express.Router();

// 중고마켓 댓글 등록 API
router.post('/:userId/:productId/comments',
    auth.verifyAccessToken,
    validate(commentSchema), async (req, res, next) => {
        try {
            const { content } = req.body;
            const { userId, productId } = req.params;
            const comment = await prisma.productComment.create({
                data: {
                    content: content,
                    product: { connect: { id: Number(productId) } },
                    user: { connect: { id: Number(userId) } },
                },
                select: { // 필요한 필드만 선택적으로 반환
                    productId: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
            res.status(201).json({
                message: '중고마켓 댓글이 성공적으로 등록되었습니다!',
                comment: comment
            });
        } catch (err) {
            // 에러 처리 미들웨어로 에러 전달
            next(err);
        }
    });

// 중고마켓 댓글 수정 API
router.patch('/:userId/:productId/comments/:commentId',
    auth.verifyAccessToken,
    auth.verifyProductCommentAuth,
    validate(commentSchema), async (req, res, next) => {
        try {
            const commentId = Number(req.params.commentId);
            const { content } = req.body;
            const updatedComment = await prisma.productComment.update({
                where: { id: commentId },
                data: {
                    content: content,
                },
                select: { // 필요한 필드만 선택적으로 반환
                    id: true,
                    productId: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
            res.status(200).json({
                message: '중고마켓 댓글이 성공적으로 수정되었습니다!',
                comment: updatedComment
            });
        } catch (err) {
            // PrismaClientKnownRequestError: P2025 (레코드를 찾을 수 없을 때)
            if (err.code === 'P2025') {
                return next(new errorHandler('댓글을 찾을 수 없습니다.', 404));
            }
            next(err);
        }
    });

// 중고마켓 댓글 삭제 API
router.delete('/:userId/:productId/comments/:commentId',
    auth.verifyAccessToken,
    auth.verifyProductCommentAuth,
    async (req, res, next) => {
        try {
            const commentId = Number(req.params.commentId);

            const deletedComment = await prisma.productComment.delete({
                where: { id: commentId },
            });
            res.status(204).send({
                comment: deletedComment
            }); // No Content (성공적으로 삭제되었지만 반환할 내용이 없을 때)
        } catch (err) {
            if (err.code === 'P2025') {
                return next(new errorHandler('댓글을 찾을 수 없습니다.', 404));
            }
            next(err);
        }
    });

// 중고마켓 댓글 목록 조회 API
router.get('/', async (req, res, next) => {
    try {
        const productId = Number(req.query.productId);
        const { cursor, limit = '10' } = req.query; // limit은 문자열로 넘어올 수 있으므로 파싱
        const parsedLimit = parseInt(limit);

        if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
            return next(new errorHandler('limit은 1에서 100 사이의 유효한 숫자여야 합니다.', 400));
        }

        // Product 존재 여부 확인 (옵션)
        const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
        if (!existingProduct) {
            return next(new errorHandler('상품을 찾을 수 없습니다.', 404));
        }

        const comments = await prisma.comment.findMany({
            where: { productId: productId },
            take: parsedLimit + 1,
            ...(cursor && {
                skip: 1,
                cursor: { createdAt: cursor },
            }),
            orderBy: {
                createdAt: 'desc', // 최신순 정렬
            },
            select: { // 필요한 필드만 선택적으로 반환
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