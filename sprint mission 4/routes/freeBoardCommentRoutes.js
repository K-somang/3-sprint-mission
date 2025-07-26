// src/routes/articleRoutes.js (또는 src/routes/freeBoardCommentRoutes.js)

import express from 'express';
// PrismaClient 인스턴스를 가져옵니다.
import prisma from '../prisma/prisma.js';
// 유효성 검증 미들웨어 (JavaScript 파일로 존재해야 함)
import { validate, commentSchema } from '../middlewares/validation.js';
// 커스텀 에러 핸들러 (JavaScript 파일로 존재해야 함)
import { errorHandler } from '../middlewares/errorHandler.js';

import auth from '../middlewares/auth.js';

const router = express.Router();

// 자유게시판 댓글 등록 API
router.post('/:userId/:articleId/comments',
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
                status: "success",
                message: "댓글이 성공적으로 등록되었습니다",
                data: comment
            });
        } catch (err) {
            // 에러 처리 미들웨어로 에러 전달
            next(err);
        }
    });

// 자유게시판 댓글 수정 API
router.patch('/:userId/:articleId/comments/:commentId',
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
                status: "success",
                message: "댓글이 성공적으로 수정되었습니다",
                data: updatedComment
            });
        } catch (err) {
            // PrismaClientKnownRequestError: P2025 (레코드를 찾을 수 없을 때)
            if (err.code === 'P2025') {
                const error = new Error('댓글을 찾을 수 없습니다.');
                error.statusCode = 404;
                return next(error);
            }
            next(err);
        }
    });

// 자유게시판 댓글 삭제 API
router.delete('/:userId/:articleId/comments/:commentId',
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
            if (err.code === 'P2025') {
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
        const { cursor, limit = '10' } = req.query; // limit은 문자열로 넘어올 수 있으므로 파싱
        const parsedLimit = parseInt(limit);

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

        const comments = await prisma.comment.findMany({
            where: { articleId: articleId },
            take: parsedLimit + 1, // 다음 페이지 존재 여부 확인을 위해 limit보다 1개 더 가져옴
            ...(cursor && { // cursor가 존재할 경우에만 skip과 cursor 옵션 추가
                skip: 1, // 커서 레코드 자신은 건너뛰고 다음 레코드부터 가져옴
                cursor: {
                    id: cursor, // cursor는 이전 마지막 레코드의 ID
                },
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
            const last = comments[parsedLimit - 1];
            nextCursor = last.id;
            comments = comments.slice(0, parsedLimit);   // 초과분 제거
        }

        res.status(200).json({
            status: "success",
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
