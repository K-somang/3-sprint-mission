import prisma from "../db.js";

type createMarketCommentinput = {
  userId: number,
  productId: number,
  content: string,
}

type updateMarketCommentinput = {
  commentId: number,
  content: string,
}

type deleteMarketCommentinput = {
  commentId: number,
}

export async function createMarketCommentService(input: createMarketCommentinput) {
  const { userId, productId, content } = input;

  if (!content || content.trim().length < 2) {
    throw new Error('댓글 내용은 2자 이상이어야 합니다');
  }

  const existingArticle = await prisma.product.findUnique({ where: { id: productId } });
  if (!existingArticle) {
    const err = new Error('게시글을 찾을 수 없습니다.');
    err.statusCode = 404;
  }

  const comment = await prisma.productComment.create({
    data: {
      product: { connect: { id: Number(productId) } },
      user: { connect: { id: Number(userId) } },
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
  return comment;
}

export async function updateMarketCommentService(input: updateMarketCommentinput) {
  const { commentId, content } = input;

  if (!content || content.trim().length < 2) {
    throw new Error('댓글 내용은 2자 이상이어야 합니다');
  }
  const updatedComment = await prisma.productComment.update({
    where: { id: commentId },
    data: {
      content: content,
    },
    select: {
      id: true,
      productId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    }
  });
  return updatedComment;
}


export async function deleteMarketCommentService(input: deleteMarketCommentinput) {
  const { commentId } = input;

  const deletedComment = await prisma.productComment.delete({
    where: { id: commentId },
  });
  return deletedComment;
}
