import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  console.log(`Found ${categories.length} categories.`);

  let totalHidden = 0;

  for (const category of categories) {
    const hiddenCount = await prisma.product.count({
      where: {
        categoryId: category.id,
        showInMenu: false,
      },
    });

    if (hiddenCount > 0) {
      console.log(
        `Category '${category.name}' (${category.slug}) has ${hiddenCount} hidden products out of ${category._count.products}.`,
      );
      totalHidden += hiddenCount;

      // FIX: Update them to visible
      const result = await prisma.product.updateMany({
        where: {
          categoryId: category.id,
          showInMenu: false,
        },
        data: {
          showInMenu: true,
        },
      });
      console.log(`  Updated ${result.count} products to be visible.`);
    }
  }

  if (totalHidden === 0) {
    console.log('No hidden products found.');
  } else {
    console.log(`Total validated products: ${totalHidden}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
