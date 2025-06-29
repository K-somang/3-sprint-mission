import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 공통 유효성 검사 함수
const validateId = (id) => {
  const num = Number(id);
  if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    throw new Error('유효하지 않은 ID 형식입니다');
  }
  return num;
};

// 공통 댓글 생성 함수
const createComment = async (parentType, parentId, content) => {
  // 부모 리소스 존재 여부 확인
  const parentExists = await prisma[parentType].findUnique({
    where: { id: parentId }
  });
  
  if (!parentExists) {
    throw new Error(`${parentType === 'product' ? '상품' : '게시글'}을 찾을 수 없습니다`);
  }

  return prisma.comment.create({
    data: {
      content,
      [parentType === 'product' ? 'productId' : 'articleId']: parentId
    }
  });
};

// 중고마켓 댓글 등록
export const createProductComment = async (req, res, next) => {
  try {
    const productId = validateId(req.params.productId);
    const { content } = req.body;
    
    if (!content || content.trim().length < 2) {
      return res.status(400).json({ message: '댓글 내용은 2자 이상이어야 합니다' });
    }

    const comment = await createComment('product', productId, content);
    res.status(201).json({ message: '댓글 등록 완료', comment });
  } catch (err) {
    next(err);
  }
};

// 자유게시판 댓글 등록
export const createArticleComment = async (req, res, next) => {
  try {
    const articleId = validateId(req.params.articleId);
    const { content } = req.body;
    
    if (!content || content.trim().length < 2) {
      return res.status(400).json({ message: '댓글 내용은 2자 이상이어야 합니다' });
    }

    const comment = await createComment('article', articleId, content);
    res.status(201).json({ message: '댓글 등록 완료', comment });
  } catch (err) {
    next(err);
  }
};

// 댓글 수정
export const updateComment = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    const { content } = req.body;
    
    if (!content || content.trim().length < 2) {
      return res.status(400).json({ message: '댓글 내용은 2자 이상이어야 합니다' });
    }

    // 댓글 존재 여부 확인
    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다' });
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { content },
    });
    res.status(200).json({ message: '댓글 수정 완료', comment });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다' });
    }
    next(err);
  }
};

// 댓글 삭제
export const deleteComment = async (req, res, next) => {
  try {
    const id = validateId(req.params.id);
    
    // 댓글 존재 여부 확인
    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다' });
    }

    await prisma.comment.delete({ where: { id } });
    res.status(200).json({ message: '댓글 삭제 완료' });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다' });
    }
    next(err);
  }
};

// 공통 댓글 목록 조회 함수
const getComments = async (parentType, parentId, req, res) => {
  const parentIdNum = validateId(parentId);
  const cursor = req.query.cursor ? validateId(req.query.cursor) : undefined;
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  
  // 부모 리소스 존재 여부 확인
  const parentExists = await prisma[parentType].findUnique({
    where: { id: parentIdNum }
  });
  
  if (!parentExists) {
    return res.status(404).json({ 
      message: `${parentType === 'product' ? '상품' : '게시글'}을 찾을 수 없습니다` 
    });
  }

  const comments = await prisma.comment.findMany({
    where: { [parentType === 'product' ? 'productId' : 'articleId']: parentIdNum },
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: { id: true, content: true, createdAt: true },
  });

  // 다음 페이지 존재 여부
  const hasNext = comments.length === limit;
  const nextCursor = hasNext ? comments[comments.length - 1].id : null;

  res.status(200).json({
    data: comments,
    pagination: { nextCursor, limit, hasNext }
  });
};

// 중고마켓 댓글 목록 조회
export const getProductComments = async (req, res, next) => {
  try {
    await getComments('product', req.params.productId, req, res);
  } catch (err) {
    next(err);
  }
};

// 자유게시판 댓글 목록 조회
export const getArticleComments = async (req, res, next) => {
  try {
    await getComments('article', req.params.articleId, req, res);
  } catch (err) {
    next(err);
  }
};
