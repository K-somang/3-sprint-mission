import prisma from '../db.js';

type CreateArticleInput = {
  title: string;
  content: string;
  userId: number;
}

type updateArticleInput = {
  articleId: number;
  title: string;
  content: string;
  userId: number;
};

type deleteArticleInput = {
  articleId: number;
};


export async function createArticleService(input: CreateArticleInput) {
  const { title, content, userId } = input;
  if (!title || !content) {
    throw new Error('필수 필드가 누락되었습니다');
  }
  if (!title || !content) {
    throw new Error('제목과 내용은 필수입니다');
  }

  const article = await prisma.article.create({
    data: {
      title,
      content,
      user: {
        connect: { id: Number(userId) },
      },
    }
  })
  return article;
}

export async function updateArticleService(input: updateArticleInput) {
  const { title, content, articleId } = input;

  if (!title || !content) {
    throw new Error('필수 필드가 누락되었습니다');
  }
  if (!title || !content) {
    throw new Error('제목과 내용은 필수입니다');
  }

  const article = await prisma.article.update({
    where: { id: Number(articleId) },
    data: { title, content },
  });
  return article;
}


export async function deleteArticleService(input: deleteArticleInput) {
  const { articleId } = input;

  const deleteArticle = await prisma.article.delete({
    where: { id: Number(articleId) },
  });
  return deleteArticle;
} 