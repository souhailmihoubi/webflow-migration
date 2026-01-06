import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Use executeRawUnsafe to bypass validtion since schema changed locally
  // We quote "Product" and column names to ensure case sensitivity matches Postgres
  const result = await prisma.$executeRawUnsafe(`
    UPDATE "Product" 
    SET "discountPrice" = "price" 
    WHERE "discountPrice" IS NULL
  `);

  console.log(`Updated products count: ${result}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
