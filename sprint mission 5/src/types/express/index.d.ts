import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        // user 객체에 실제 필요한 필드들 정의
        // 예: role?: string;
      }
    }
  }
}

// src/types/express/index.d.ts 등
declare namespace Express {
  export interface Request {
    user?: {
      id: number;
      // 필요한 추가 프로퍼티...
    }
  }
}

interface ExtendedError extends Error {
  code?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: number };  // id 필드는 반드시 있다고 가정
    }
  }
}

type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

declare global {
  interface Error {
    statusCode?: number;
  }
}

