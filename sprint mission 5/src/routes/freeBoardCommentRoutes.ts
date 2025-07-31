import express from 'express';
// PrismaClient 인스턴스를 가져옵니다.
import prisma from '../prisma/prisma.js';
// 유효성 검증 미들웨어 (JavaScript 파일로 존재해야 함)
import { validate, commentSchema } from '../middlewares/validation.js';
// 커스텀 에러 핸들러 (JavaScript 파일로 존재해야 함)
import { errorHandler } from '../middlewares/errorHandler.js';

import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

// 자유게시판 댓글 등록 API
router.post('/:userId/:articleId/',
    auth.verifyAccessToken,
    validate(commentSchema), async (req, res, next) => {
        try {
            const articleId = parseInt(req.params.articleId, 10);
            if (isNaN(articleId)) {
                const err = new Error('유효하지 않은 게시글 ID입니다.');
                err.statusCode = 400;
                return next(err)
            };
            const { content } = req.body;
            const { userId } = req.params;

            // Article 존재 여부 확인 (옵션: 실제 DB에 없는 Article ID로 댓글 달리는 것을 방지)
            const existingArticle = await prisma.article.findUnique({ where: { id: articleId } });
            if (!existingArticle) {
                const err = new Error('게시글을 찾을 수 없습니다.');
                err.statusCode = 404;
                return next(err);
            }
            const comment = await prisma.articleComment.create({
                data: {
                    article: { connect: { id: Number(articleId) } },
                    user: { connect: { id: Number(userId) } },
                    content: content,
                },
                select: { // 필요한 필드만 선택적으로 반환
                    id: true,
                    articleId: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
            res.status(201).json({
                message: "댓글이 성공적으로 등록되었습니다",
                data: comment
            });
        } catch (err) {
            // 에러 처리 미들웨어로 에러 전달
            next(err);
        }
    });

// 자유게시판 댓글 수정 API
router.patch('/:userId/:articleId/:commentId',
    auth.verifyAccessToken,
    auth.verifyArticleCommentAuth,
    validate(commentSchema), async (req, res, next) => {
        try {
            const articleId = parseInt(req.params.articleId, 10);
            const commentId = parseInt(req.params.commentId, 10);
            if (isNaN(articleId) || isNaN(commentId)) {
                const err = new Error('유효하지 않은 ID입니다.');
                err.statusCode = 400;
                return next(err);
            }
            const { content } = req.body;

            const updatedComment = await prisma.articleComment.update({
                where: { id: commentId },
                data: { content: content },
                select: { // 필요한 필드만 선택적으로 반환
                    id: true,
                    articleId: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
            res.status(200).json({
                message: "댓글이 성공적으로 수정되었습니다",
                data: updatedComment
            });
        } catch (err) {
            // PrismaClientKnownRequestError: P2025 (레코드를 찾을 수 없을 때)
            if (typeof err === "object" && err && "code" in err && (err as any).code === 'P2025') {
                const error = new Error('댓글을 찾을 수 없습니다.');
                error.statusCode = 404;
                return next(error);
            }
            next(err);
        }
    });

// 자유게시판 댓글 삭제 API
router.delete('/:userId/:articleId/:commentId',
    auth.verifyAccessToken,
    auth.verifyArticleCommentAuth,
    async (req, res, next) => {
        try {
            const articleId = parseInt(req.params.articleId, 10);
            const commentId = parseInt(req.params.commentId, 10);
            if (isNaN(articleId) || isNaN(commentId)) {
                const err = new Error('유효하지 않은 ID입니다.');
                err.statusCode = 400;
                return next(err);
            }
            await prisma.articleComment.delete({
                where: { id: commentId },
            });
            res.status(204).send(); // No Content (성공적으로 삭제되었지만 반환할 내용이 없을 때)
        } catch (err) {
            if (typeof err === "object" && err && "code" in err && (err as any).code === 'P2025') {
                const error = new Error('댓글을 찾을 수 없습니다.');
                error.statusCode = 404;
                return next(error);
            }
            next(err);
        }
    });

// 자유게시판 댓글 목록 조회 API
router.get('/:articleId/comments', async (req, res, next) => {
    try {
        const articleId = parseInt(req.params.articleId, 10);
        if (isNaN(articleId)) {
            const err = new Error('유효하지 않은 게시글 ID입니다.');
            err.statusCode = 400;
            return next(err);
        }
        const { cursor, limit = '10' } = req.query
        let parsedLimit = 10;
        if (typeof limit === 'string') {
            parsedLimit = parseInt(limit, 10);
        } else if (Array.isArray(limit)) {
            parsedLimit = parseInt(limit[0] as string, 10);
        }

        if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
            const err = new Error('limit은 1에서 100 사이의 유효한 숫자여야 합니다.');
            err.statusCode = 400;
            return next(err);
        }

        // Article 존재 여부 확인 (옵션)
        const existingArticle = await prisma.article.findUnique({ where: { id: articleId } });
        if (!existingArticle) {
            const err = new Error('게시글을 찾을 수 없습니다.');
            err.statusCode = 404;
            return next(err);
        }
        let cursorObj: { id: number } | undefined;

        if (cursor) {
            if (typeof cursor === 'string' && !isNaN(Number(cursor))) {
                cursorObj = { id: Number(cursor) };
            } else if (Array.isArray(cursor) && cursor.length > 0 && typeof cursor[0] === 'string' && !isNaN(Number(cursor[0]))) {
                cursorObj = { id: Number(cursor[0]) };
            } else {
                cursorObj = undefined; // 악성값인 경우 undefined 처리
            }
        }

        let comments = await prisma.articleComment.findMany({
            where: { articleId: articleId },
            take: parsedLimit + 1,
            ...(cursorObj && {
                skip: 1,
                cursor: cursorObj,
            }),
            orderBy: {
                createdAt: 'desc',
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
            const last = comments[parsedLimit - 1];
            nextCursor = last.id;
            comments = comments.slice(0, parsedLimit);   // 초과분 제거
        }

        res.status(200).json({
            message: "댓글 목록을 성공적으로 조회했습니다",
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
