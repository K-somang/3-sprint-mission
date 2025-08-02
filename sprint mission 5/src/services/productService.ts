import prisma from '../db.js';

type CreateProductInput = {
  name: string;
  description: string;
  price: number;
  tags?: string[];
  userId: number;
  imageUrl?: string | null;
}

type UpdateProductInput = {
  productId: number;
  name: string;
  description: string;
  price: number;
  tags?: string[];
  imageUrl?: string;
  userId: number;
};

type DeleteProductInput = {
  productId: number;
};


export async function createProductService(input: CreateProductInput) {
  const { name, description, price, tags, userId } = input;

  if (!name || !description || !price) {
    throw new Error('필수 필드가 누락되었습니다');
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      tags,
      user: {
        connect: { id: Number(userId) },
      },
    },
  });

  return product;
}


export async function updateProductService(input: UpdateProductInput) {
  const { productId, name, description, price, tags, userId } = input;

  if (!name || !description || !price) {
    throw new Error('필수 필드가 누락되었습니다');
  }
  const data = { name, description, price, tags, userId };

  const updatedProduct = await prisma.product.update({
    where: { id: Number(productId) },
    data,
  });

  return updatedProduct;
}

export async function deleteProductService(input: DeleteProductInput) {
  const { productId } = input;

  const updatedProduct = await prisma.product.delete({
    where: { id: Number(productId) },
  });

  return updatedProduct;
}