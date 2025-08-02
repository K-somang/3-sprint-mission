import prisma from "../db.js";

type createBoardcomment = {
  userId: number,
  articleId: number,
  content: string,
}

type updateBoardcomment = {
  commentId: number,
  content: string,
}

type deleteBoardcomment = {
  commentId: number,
}

export async function createMarketCommentService(input: createBoardcomment) {
  const { userId, articleId, content } = input;

  if (!content || content.trim().length < 2) {
    throw new Error('댓글 내용은 2자 이상이어야 합니다');
  }

  const existingArticle = await prisma.product.findUnique({ where: { id: articleId } });
  if (!existingArticle) {
    const err = new Error('게시글을 찾을 수 없습니다.');
    err.statusCode = 404;
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
  return comment;
}


export async function updateMarketCommentService(input: updateBoardcomment) {
  const { commentId, content } = input;

  if (!content || content.trim().length < 2) {
    throw new Error('댓글 내용은 2자 이상이어야 합니다');
  }

  const existingArticle = await prisma.product.findUnique({ where: { id: commentId } });
  if (!existingArticle) {
    const err = new Error('게시글을 찾을 수 없습니다.');
    err.statusCode = 404;
  }

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
  return updatedComment;
}


export async function deleteMarketCommentService(input: deleteBoardcomment) {
  const { commentId } = input;

  const comment = await prisma.articleComment.delete({
    where: { id: commentId }
  });
  return comment;
}