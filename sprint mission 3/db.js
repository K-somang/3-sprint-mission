// src/db.js  (ESM 예시)
import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  // 프로덕션: 단순 싱글턴
  prisma = new PrismaClient();
} else {
  // 개발: Hot-Reload 때 전역(globalThis)에 보관
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient();
  }
  prisma = globalThis.prisma;
}

export default prisma;
