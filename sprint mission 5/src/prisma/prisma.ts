import { PrismaClient } from '@prisma/client';

// PrismaClient 인스턴스를 생성합니다.
// 이 인스턴스는 prisma/schema.prisma 파일과
// .env 파일 또는 환경 변수로 설정된 DATABASE_URL을 참조하여
// 데이터베이스 연결을 자동으로 처리합니다.
const prisma = new PrismaClient();

// 생성된 PrismaClient 인스턴스를 다른 파일에서 사용할 수 있도록 내보냅니다.
// 이 인스턴스를 사용하면 애플리케이션의 어느 곳에서든 데이터베이스와 상호작용할 수 있습니다.
export default prisma;
