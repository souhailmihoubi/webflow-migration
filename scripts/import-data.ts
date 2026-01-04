import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

function cleanHtml(html: string): string {
  if (!html) return '';
  // Remove id attributes and empty p tags with zero-width spaces or similar
  return html
    .replace(/id="[^"]*"/g, '')
    .replace(/<p>\s*‌\s*<\/p>/g, '')
    .replace(/<p><\/p>/g, '')
    .trim();
}

function parsePrice(price: string): number {
  if (!price) return 0;
  // Remove spaces and replace comma with dot
  const cleaned = price.replace(/\s/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

async function main() {
  console.log('🚀 Starting Data Import...');

  const baseDir = path.join(__dirname, '..');
  const categoriesPath = path.join(
    baseDir,
    'data',
    "L'Artistou Meuble - Nos Categories (1).csv",
  );
  const productsPath = path.join(
    baseDir,
    'data',
    "L'Artistou Meuble - Products (2).csv",
  );

  // 1. Import Categories
  console.log('📁 Importing Categories...');
  const categoriesRaw = fs.readFileSync(categoriesPath, 'utf-8');
  const categoriesData = parse(categoriesRaw, {
    columns: true,
    skip_empty_lines: true,
  }) as any[];

  const categoryMap = new Map<string, string>();

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.Slug },
      update: {
        name: cat.Name,
        image: cat['Category Image'],
        showInHomePage: cat['Show in Home']?.toUpperCase() === 'TRUE',
      },
      create: {
        name: cat.Name,
        slug: cat.Slug,
        image: cat['Category Image'],
        showInHomePage: cat['Show in Home']?.toUpperCase() === 'TRUE',
      },
    });
    categoryMap.set(cat.Slug, created.id);
    console.log(`✅ Category synced: ${cat.Name}`);
  }

  // 2. Import Products
  console.log('🛒 Importing Products...');
  const productsRaw = fs.readFileSync(productsPath, 'utf-8');
  const productsData = parse(productsRaw, {
    columns: true,
    skip_empty_lines: true,
  }) as any[];

  const foundCategories = new Set<string>();
  productsData.forEach((p) => foundCategories.add(p['Catégorie']));
  console.log(
    '📊 Categories found in Products CSV:',
    Array.from(foundCategories),
  );

  let productCount = 0;
  for (const prod of productsData) {
    if (!prod.Slug || prod.Slug === 'ds') continue; // Skip placeholders

    const catId = categoryMap.get(prod['Catégorie']);
    if (!catId) {
      console.warn(
        `⚠️ Skipping product ${prod.Name}: Category ${prod['Catégorie']} not found.`,
      );
      continue;
    }

    const multiImages = prod['Multi Images']
      ? prod['Multi Images']
          .split(';')
          .map((img: string) => img.trim())
          .filter((img: string) => img)
      : [];

    await prisma.product.upsert({
      where: { slug: prod.Slug },
      update: {
        name: prod.Name,
        mainImage: prod['Main Image'],
        multiImages: multiImages,
        priceDetails: prod['Détails Prix'],
        productDescription: cleanHtml(prod["Détails de L'article"]),
        caracteristiques: cleanHtml(prod['Informations Complémentaires']),
        price: parsePrice(prod['Prix hors promotion']),
        discountPrice: prod['Prix de promotion']
          ? parsePrice(prod['Prix de promotion'])
          : null,
        showInMenu: prod['Afficher']?.toLowerCase() === 'true',
        videoLink: prod['Video link Youtube seulement'],
        categoryId: catId,
      },
      create: {
        name: prod.Name,
        slug: prod.Slug,
        mainImage: prod['Main Image'],
        multiImages: multiImages,
        priceDetails: prod['Détails Prix'],
        productDescription: cleanHtml(prod["Détails de L'article"]),
        caracteristiques: cleanHtml(prod['Informations Complémentaires']),
        price: parsePrice(prod['Prix hors promotion']),
        discountPrice: prod['Prix de promotion']
          ? parsePrice(prod['Prix de promotion'])
          : null,
        showInMenu: prod['Afficher']?.toLowerCase() === 'true',
        videoLink: prod['Video link Youtube seulement'],
        categoryId: catId,
      },
    });

    productCount++;
    if (productCount % 50 === 0) {
      console.log(`⏳ Processed ${productCount} products...`);
    }
  }

  console.log(
    `✨ Mission Accomplished! Synced ${categoriesData.length} categories and ${productCount} products.`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Error during import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
