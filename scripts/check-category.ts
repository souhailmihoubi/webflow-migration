import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const slug = 'salon'; // Or 'cac' or whatever
  console.log(`Checking category: ${slug}`);

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    console.log('Category not found');
    return;
  }

  console.log('Category found:', category.name, category.id);

  // Count all products in this category
  const totalProducts = await prisma.product.count({
    where: { categoryId: category.id },
  });

  console.log(`Total products in category: ${totalProducts}`);

  // Count visible products
  const visibleProducts = await prisma.product.count({
    where: {
      categoryId: category.id,
      showInMenu: true,
    },
  });

  console.log(`Visible products (showInMenu: true): ${visibleProducts}`);

  // Count hidden products
  const hiddenProducts = await prisma.product.count({
    where: {
      categoryId: category.id,
      showInMenu: false,
    },
  });

  console.log(`Hidden products (showInMenu: false): ${hiddenProducts}`);

  if (visibleProducts < totalProducts) {
    console.log('WARNING: Some products are hidden from the menu!');
    const hidden = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        showInMenu: false,
      },
      select: { name: true, slug: true },
    });
    console.log('Hidden products:', hidden);
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
