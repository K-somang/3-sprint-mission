import express from 'express';
import prisma from '../prisma/prisma.js';
import { validate, commentSchema } from '../middlewares/validation.js';
import boardCommentController from '../controllers/boardCommentController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

// 자유게시판 댓글 등록 API
router.post('/:articleId/comments',
    auth.verifyAccessToken,
    validate(commentSchema),
    boardCommentController.createBoardCommnet,
)

// 자유게시판 댓글 수정 API
router.patch('/:articleId/comments/:commentId',
    auth.verifyAccessToken,
    auth.verifyArticleCommentAuth,
    validate(commentSchema),
    boardCommentController.updateBoardComment,
)

// 자유게시판 댓글 삭제 API
router.delete('/:articleId/comments/:commentId',
    auth.verifyAccessToken,
    auth.verifyArticleCommentAuth,
    boardCommentController.deleteBoardComment,
);

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
            res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
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
