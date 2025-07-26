import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 게시글 등록
export const createArticle = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    
    // 입력값 검증
    if (!title || !content) {
      return res.status(400).json({ message: '제목과 내용은 필수입니다' });
    }

    const article = await prisma.article.create({
      data: { 
        title, 
        content, 
        user: {
          connectOrCreate: {
            where: { email: 'x@y.z' },
            create: { email: 'x@y.z' }
     }} 
  },
    });
    res.status(201).json({ message: '게시글 등록 완료', article });
  } catch (err) {
    next(err);
  }
};

// 게시글 상세 조회
export const getArticle = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    if (id.error) return res.status(400).json(id.error);

    const article = await prisma.article.findUnique({ 
      where: { id: id.value } 
    });
    
    if (!article) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    
    res.status(200).json(article);
  } catch (err) {
    next(err);
  }
};

// 게시글 목록 조회
export const getArticles = async (req, res, next) => {
  try {
    const { search = '', order = 'desc' } = req.query;
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

    const where = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: order === 'asc' ? 'asc' : 'desc' },
        select: { id: true, title: true, createdAt: true },
      }),
      prisma.article.count({ where })
    ]);

    res.status(200).json({
      data: articles,
      pagination: { total, offset, limit }
    });
  } catch (err) {
    next(err);
  }
};

// 게시글 수정
export const updateArticle = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    if (id.error) return res.status(400).json(id.error);
    
    const { title, content } = req.body;
    
    // 존재 여부 확인
    const existing = await prisma.article.findUnique({ 
      where: { id: id.value } 
    });
    if (!existing) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    }

    const article = await prisma.article.update({
      where: { id: id.value },
      data: { title, content },
    });
    
    res.status(200).json({ message: '게시글 수정 완료', article });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    }
    next(err);
  }
};

// 게시글 삭제
export const deleteArticle = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    if (id.error) return res.status(400).json(id.error);
    
    // 존재 여부 확인
    const existing = await prisma.article.findUnique({ 
      where: { id: id.value } 
    });
    if (!existing) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    }

    await prisma.article.delete({ where: { id: id.value } });
    res.status(200).json({ message: '게시글 삭제 완료' });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다' });
    }
    next(err);
  }
};

// ID 검증 헬퍼 함수
function validateId(id) {
  const num = Number(id);
  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    return { error: { message: '유효하지 않은 게시글 ID입니다' } };
  }
  return { value: num };
}
