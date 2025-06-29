// prisma/seed.ts  (ESM)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding…');

  /* 0. 기존 데이터 정리(제약 순서 유의) */
  await prisma.comment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();

  /* 1. 사용자 5명 선시드 ──> 이후 FK에 사용 */
  const users = await Promise.all(
    ['kim', 'lee', 'park', 'choi', 'jung'].map((name, i) =>
      prisma.user.create({
        data: {
          email: `${name}@example.com`,
          password: 'hashed',           // 실제 서비스라면 bcrypt 사용
          name: name,
        },
      }),
    ),
  );

  /* 2. 상품 시드 (userId 포함, 배열-필드 호환 위해 create 반복) */
  const productSeed = [
    {
      name: 'iPhone 13 Pro',
      description:
        '거의 새것 같은 아이폰 13 프로입니다. 액정 보호필름과 케이스 사용으로 스크래치 없습니다.',
      price: 850000,
      tags: ['전자제품', '스마트폰', '애플', '중고'],
    },
    {
      name: 'MacBook Air M2',
      description: '2022년형 맥북 에어 M2 모델입니다. 대학생이 사용했으며 상태 양호합니다.',
      price: 1200000,
      tags: ['전자제품', '노트북', '애플', '대학생'],
    },
    {
      name: '게이밍 키보드',
      description: '기계식 키보드 청축입니다. RGB 백라이트 지원하며 게임용으로 최적화.',
      price: 120000,
      tags: ['전자제품', '키보드', '게이밍', '기계식'],
    },
    {
      name: '무선 마우스',
      description: '로지텍 무선 마우스입니다. 배터리 수명 길고 정확도 높습니다.',
      price: 45000,
      tags: ['전자제품', '마우스', '로지텍', '무선'],
    },
    {
      name: '책상',
      description: '원목 책상입니다. 크기 120x60cm, 서랍 2개 포함.',
      price: 180000,
      tags: ['가구', '책상', '원목', '서랍'],
    },
  ];

  const createdProducts = [];
  for (let i = 0; i < productSeed.length; i++) {
    createdProducts.push(
      await prisma.product.create({
        data: { ...productSeed[i], userId: users[i % users.length].id },
      }),
    );
  }

  /* 3. 게시글 시드 (createMany OK: 배열 필드 없음) */
  const articleSeed = [
    {
      title: '중고 거래 팁 공유합니다',
      content:
        '안전한 중고 거래를 위한 몇 가지 팁을 공유드립니다. 첫째, 직거래 시 공공장소에서 만나세요.…',
    },
    {
      title: '전자제품 구매 시 주의사항',
      content:
        '중고 전자제품을 구매할 때는 다음 사항들을 확인해보세요. 배터리 상태, 화면 상태…',
    },
    {
      title: '학용품 나눔 이벤트',
      content:
        '새 학기를 맞아 사용하지 않는 학용품들을 나눔하고자 합니다. 필요하신 분들은 댓글로 연락주세요…',
    },
    {
      title: '가구 배송 관련 문의',
      content: '큰 가구류의 경우 배송이 어려운 경우가 많습니다. 직접 픽업 가능한 분들과…',
    },
    {
      title: '사기 피해 신고합니다',
      content:
        '최근 허위 상품 등록으로 사기를 당했습니다. 모든 분들이 조심하시기 바라며, 의심스러운 거래는…',
    },
  ].map((a, idx) => ({ ...a, userId: users[idx].id }));

  const { count: articleCount } = await prisma.article.createMany({
    data: articleSeed,
  });
  const createdArticles = await prisma.article.findMany();

  console.log(`✅ 상품 ${createdProducts.length}개, 게시글 ${articleCount}개 생성`);

  /* 4. 댓글 시드 (userId 포함, FK 한쪽만 채움) */
  const commentSeed = [];

  createdProducts.slice(0, 3).forEach((p, i) => {
    commentSeed.push(
      {
        content: '상품 상태가 어떤가요?',
        productId: p.id,
        userId: users[i].id,
      },
      {
        content: '가격 조금 더 할인 가능한가요?',
        productId: p.id,
        userId: users[(i + 1) % users.length].id,
      },
    );
  });

  createdArticles.slice(0, 3).forEach((a, i) => {
    commentSeed.push(
      {
        content: '좋은 정보 감사합니다!',
        articleId: a.id,
        userId: users[i].id,
      },
      {
        content: '저도 같은 경험이 있네요.',
        articleId: a.id,
        userId: users[(i + 2) % users.length].id,
      },
    );
  });

  const { count: commentCount } = await prisma.comment.createMany({
    data: commentSeed,
  });

  console.log(`✅ 댓글 ${commentCount}개 생성`);
  console.log('🎉  시드 완료!');
}

main()
  .catch((e) => {
    console.error('❌  시드 실패:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
