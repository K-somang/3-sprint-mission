// prisma/seed.ts  (ESM)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding…');

  /* 0. 기존 데이터 정리(제약 순서 유의) */
  await prisma.productComment.deleteMany();
  await prisma.articleComment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();

  /* 1. 사용자 4명 선시드 ──> 이후 FK에 사용 */
  const users = await Promise.all(
    ['kim', 'lee'].map((name, i) =>
      prisma.user.create({
        data: {
          email: `${name}@example.com`,
          password: 'hashed',           // 실제 서비스라면 bcrypt 사용
          name: name,
          nickname: '김철수',
        },
      }),
    ),
  );
  console.log(`✅ 유저 ${users.length}명 생성`),
    console.log('🎉  유저 완료!')

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
  ].map((a, idx) => ({ ...a, userId: users[idx].id }));

  const { count: articleCount } = await prisma.article.createMany({
    data: articleSeed,
  });
  const createdArticles = await prisma.article.findMany();

  console.log(`✅ 상품 ${createdProducts.length}개, 게시글 ${articleCount}개 생성`);

  /* 4. 상품 댓글 시드 (userId 포함, FK 한쪽만 채움) */
  const productCommentSeed: { content: string; productId: any; userId: any; }[] = [];

  createdProducts.slice(0, 2).forEach((p, i) => {
    productCommentSeed.push(
      {
        content: i === 0 ? '상품 상태가 어떤가요?' : '가격 조금 더 할인 가능한가요?',
        productId: p.id,
        userId: users[i % users.length].id,
      }
    );
  });

  const { count: productCommentCount } = await prisma.productComment.createMany({
    data: productCommentSeed,
  });

  console.log(`✅ 상품 댓글 ${productCommentCount}개 생성`);
  console.log('🎉  시드 완료!');


  /* 5. 게시글 댓글 시드 (userId 포함, FK 한쪽만 채움) */
  const articleCommentSeed: { content: string; articleId: any; userId: any; }[] = [];

  createdArticles.slice(0, 2).forEach((a: { id: any; }, i: number) => {
    articleCommentSeed.push(
      {
        content: i === 0 ? '좋은 정보 감사합니다!' : '저도 같은 경험이 있네요.',
        articleId: a.id,
        userId: users[i % users.length].id,
      }
    );
  });

  const { count: articleCommentCount } = await prisma.articleComment.createMany({
    data: articleCommentSeed,
  });

  console.log(`✅ 게시글 댓글 ${articleCommentCount}개 생성`);
  console.log('🎉  시드 완료!');

}

main()
  .catch((e) => {
    console.error('❌  시드 실패:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
