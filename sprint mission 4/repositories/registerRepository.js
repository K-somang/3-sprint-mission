import prisma from '../prisma/prisma.js';

async function findById(id) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

async function findByEmail(email) {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
}

async function save(user) {
  return prisma.user.create({
    data: {
      email: user.email,
      nickname: user.nickname,
      password: user.password,
    },
  });
}

async function getUser(id) {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      nickname: true,
      createdAt: true,
      updatedAt: true,
    }
  });
}

async function createOrUpdate(user) {
  return prisma.user.upsert({
    where: {
      id: user.id
    },
    update: {
      email: user.email,
      nickname: user.nickname,
      password: user.password,
    },
    create: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      password: user.password,
    },
  });
}

async function getByProductId(id) {

  const review = await prisma.product.findUnique({
    where: {
      id: parseInt(id, 10),
    },
  });
  return review;
}

async function getByArticleId(id) {

  const review = await prisma.article.findUnique({
    where: {
      id: parseInt(id, 10),
    },
  });
  return review;
}

async function getByProductCommentId(id) {

  const review = await prisma.productComment.findUnique({
    where: {
      id: parseInt(id, 10),
    },
  });
  return review;
}

async function getByArticleCommentId(id) {

  const review = await prisma.articleComment.findUnique({
    where: {
      id: parseInt(id, 10),
    },
  });
  return review;
}

export default {
  findById,
  findByEmail,
  save,
  getUser,
  createOrUpdate,
  getByProductId,
  getByArticleId,
  getByProductCommentId,
  getByArticleCommentId,
}
