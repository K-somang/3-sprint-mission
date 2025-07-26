import { body, validationResult } from 'express-validator';
// ✅ CustomError 클래스 경로 수정: '../middlewares/errorHandler.js'
import { CustomError } from './errorHandler.js';

// 상품 유효성 검증 규칙
export const productSchema = [ // 'productSchema'는 이제 검증 체인 배열입니다.
    // 'name' 필드
    body('name')
        .trim() // 앞뒤 공백 제거
        .notEmpty().withMessage('상품 이름은 필수입니다.')
        .isLength({ min: 2, max: 100 }).withMessage('상품 이름은 2자에서 100자 사이여야 합니다.'),

    // 'description' 필드
    body('description')
        .trim()
        .optional({ checkFalsy: true }) // 비어있어도 되고, 있으면 검증
        .isLength({ min: 10, max: 1000 }).withMessage('상품 설명은 10자에서 1000자 사이여야 합니다.'),

    // 'price' 필드
    body('price')
        .notEmpty().withMessage('가격은 필수입니다.')
        .customSanitizer(v => (typeof v === 'number' ? v.toString() : v))
        .isFloat({ gt: 0 }).withMessage('가격은 0보다 큰 숫자여야 합니다.') // 단일 검증
        .toFloat(), // 이후 숫자 타입으로 사용

    // 'tags' 필드 (선택적 배열 검증)
    body('tags')
        .optional()
        .isArray().withMessage('태그는 배열 형식이어야 합니다.')
        .custom(value => 
            value.every(tag => 
            typeof tag === 'string' && tag.trim() !== ''
            )
        ).withMessage('모든 태그는 비어있지 않은 문자열이어야 합니다.')
];

// 게시글 유효성 검증 규칙
export const articleSchema = [ // 'articleSchema'는 이제 검증 체인 배열입니다.
    // 'title' 필드
    body('title')
        .trim()
        .notEmpty().withMessage('게시글 제목은 필수입니다.')
        .isLength({ min: 5, max: 200 }).withMessage('게시글 제목은 5자에서 200자 사이여야 합니다.'),

    // 'content' 필드
    body('content')
        .trim()
        .notEmpty().withMessage('게시글 내용은 필수입니다.')
        .isLength({ min: 10, max: 5000 })
        .escape() // ❗HTML 특수문자 이스케이프 추가
        .withMessage('게시글 내용은 10자에서 5000자 사이여야 합니다.')
];

// 댓글 유효성 검증 규칙
export const commentSchema = [ // 'commentSchema'는 이제 검증 체인 배열입니다.
    // 'content' 필드
    body('content')
        .trim()
        .notEmpty().withMessage('댓글 내용은 필수입니다.')
        .isLength({ min: 2, max: 500 }).withMessage('댓글 내용은 2자에서 500자 사이여야 합니다.')
];

export const validate = (validations) => {
  return async (req, res, next) => {
    // 모든 검증 병렬 실행
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    const extractedErrors = errors.array().map(err => err.msg);
    next(new CustomError(`유효성 검증 실패: ${extractedErrors.join(', ')}`, 400));
  };
};


export default validate;