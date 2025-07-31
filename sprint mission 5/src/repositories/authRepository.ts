import prisma from '../prisma/prisma.js';

async function findById(id: any) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

async function findByEmail(email: any) {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
}

async function save(user: { email: any; nickname: any; password: any; }) {
  return prisma.user.create({
    data: {
      email: user.email,
      nickname: user.nickname,
      password: user.password,
    },
  });
}

async function getUser(id: any) {
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

async function createOrUpdate(user: { id: any; email: any; nickname: any; password: any; }) {
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

async function getByProductId(id: string) {

  const review = await prisma.product.findUnique({
    where: {
      id: parseInt(id, 10),
    },
  });
  return review;
}

async function getByArticleId(id: string) {

  const review = await prisma.article.findUnique({
    where: {
      id: parseInt(id, 10),
    },
  });
  return review;
}

async function getByProductCommentId(id: string) {

  const review = await prisma.productComment.findUnique({
    where: {
      id: parseInt(id, 10),
    },
  });
  return review;
}

async function getByArticleCommentId(id: string) {

  const review = await prisma.articleComment.findUnique({
    where: {
      id: parseInt(id, 10),
    },
  });
  return review;
}

async function getProductInfo(id: any) {
  return prisma.product.findUnique({
    where: {
      id,
    },
    select: {
      name: true,
      description: true,
      price: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
    }
  });
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
  getProductInfo,
}
