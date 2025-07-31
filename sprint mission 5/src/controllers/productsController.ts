import { RequestHandler } from 'express'
import { Prisma, PrismaClient } from '@prisma/client';
import type { ParsedQs } from 'qs';

const prisma = new PrismaClient();

// ID 검증 헬퍼
const validateId = (id: string | number) => {
  const num = Number(id);
  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    throw new Error('유효하지 않은 상품 ID');
  }
  return num;
};

// 상품 등록
export const createProduct: RequestHandler = async (req, res, next) => {
  try {
    const { name, description, price, tags } = req.body;
    const imageUrl = req.file ? `/images/${req.file.filename}` : null;

    // 입력값 검증
    if (!name || !description || !price) {
      return res.status(400).json({ message: '필수 필드가 누락되었습니다' });
    }
    if (tags && (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string'))) {
      return res.status(400).json({ message: '태그는 문자열 배열이어야 합니다' });
    }

    const intPrice = Number(price);
    if (isNaN(intPrice)) throw new Error('유효하지 않은 가격입니다');

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: intPrice,
        tags,
        user: {
          connectOrCreate: {
            where: { email: 'x@y.z' },
            create: {
              email: 'x@y.z',
              nickname: '',
              password: '',
            },
          }
        }
      },
    });
    res.status(201).json({ message: '상품 등록 완료', product });
  } catch (err) {
    next(err);
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

// 상품 목록 조회
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

export const getProducts: RequestHandler = async (req, res, next) => {
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

// 상품 수정
export const updateProduct: RequestHandler = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    const { name, description, price, tags } = req.body;

    // 존재 여부 확인
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다' });
    }

    const intPrice = Number(price);
    if (isNaN(intPrice)) throw new Error('유효하지 않은 가격입니다');

    type UpdateProductInput = {
      name?: string;
      description?: string;
      price?: number;
      tags?: string[];
      imageUrl?: string;
    };

    // 함수 안이나 컨트롤러에서
    let updateData: UpdateProductInput = {
      name,
      description,
      price,
      tags,
    };

    // 이미지 업데이트 처리
    if (req.file) {
      updateData.imageUrl = `/images/${req.file.filename}`;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    res.status(200).json({ message: '상품 수정 완료', product });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다' });
    }
    next(err);
  }
};

// 상품 삭제
export const deleteProduct: RequestHandler = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);

    // 존재 여부 확인
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다' });
    }

    await prisma.product.delete({ where: { id } });
    res.status(200).json({ message: '상품 삭제 완료' });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다' });
    }
    next(err);
  }
};
