import { RequestHandler } from 'express'
import { Prisma, PrismaClient } from '@prisma/client';
import type { ParsedQs } from 'qs';
import { createProductService, updateProductService, deleteProductService } from '../services/productService.js';

const prisma = new PrismaClient();

// ID 검증 헬퍼
const validateId = (productId: string | number) => {
  const num = Number(productId);
  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    throw new Error('유효하지 않은 상품 ID');
  }
  return num;
};

// 상품 등록
const createProduct: RequestHandler = async (req, res, next) => {
  if (!req.user || typeof req.user.id !== 'number') {
    return res.status(401).json({ error: '인증 정보가 없습니다.' });
  }
  const userId = req.user.id;
  try {
    const { name, description, price, tags } = req.body;
    const imageUrl = req.file ? `/images/${req.file.filename}` : null;

    const product = await createProductService({ name, description, price, tags, userId, imageUrl });

    res.status(201).json({ message: '상품 등록 완료', product });
  } catch (error) {
    console.error('상품 등록 오류:', error);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
    return next(error);
  }
};

// 상품 수정
const updateProduct: RequestHandler = async (req, res, next) => {
  try {
    const productId = validateId(req.params.productId);
    const { name, description, price, tags } = req.body;
    if (!req.user || typeof req.user.id !== 'number') {
      return res.status(401).json({ error: '인증 정보가 없습니다.' });
    }
    const userId = req.user.id;
    const updateProduct = await updateProductService({ productId, name, description, price, tags, userId });


    res.status(200).json({ message: '상품 수정 완료', updateProduct });
  } catch (err) {
    console.error('상품 수정 오류:', err);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
  }
};

// 상품 삭제
const deleteProduct: RequestHandler = async (req, res, next) => {
  try {
    const productId = validateId(req.params.productId);
    if (!req.user || typeof req.user.id !== 'number') {
      return res.status(401).json({ error: '인증 정보가 없습니다.' });
    }
    const deleteProduct = await deleteProductService({ productId });

    res.status(200).json({ message: '상품 삭제 완료', deleteProduct });
  } catch (err) {
    console.error('상품 삭제 오류:', err);
    res.status(500).json({ error: '서버에 오류가 발생했습니다.' });
  }
};


// 상품 상세 조회
export const getProduct: RequestHandler = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

function toString(value: string | ParsedQs | (string | ParsedQs)[] | undefined): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    const first = value[0];
    if (typeof first === 'string') {
      return first;
    }
  }
  return undefined;
}

// 상품 목록 조회
const getProducts: RequestHandler = async (req, res, next) => {
  try {
    const search = toString(req.query.search) ?? '';
    const order = toString(req.query.order) === 'asc' ? 'asc' : 'desc';

    const offset = Math.max(0, Number(req.query.offset) || 0);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const where: Prisma.ProductWhereInput = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: order },
        select: { id: true, name: true, price: true, createdAt: true },
      }),
      prisma.product.count({ where })
    ]);

    res.status(200).json({
      data: products,
      pagination: { total, offset, limit }
    });
  } catch (err) {
    next(err);
  }
};

export default {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};