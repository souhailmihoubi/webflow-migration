import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import axios from 'axios';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Init S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
const bucketName = process.env.AWS_S3_BUCKET || '';

async function processImage(
  url: string | undefined,
  folder: string,
): Promise<string> {
  if (!url || typeof url !== 'string') return '';

  // Return if already an S3 URL or invalid
  if (url.includes('amazonaws.com') || !url.startsWith('http')) {
    return url;
  }

  try {
    console.log(`⬇️  Downloading ${url.substring(0, 50)}...`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // Optimize
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Upload
    const fileName = `${randomUUID()}.jpg`;
    const key = `${folder}/${fileName}`;

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: optimizedBuffer,
        ContentType: 'image/jpeg',
      },
    });

    await upload.done();
    const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log(`✅ Migrated to S3: ${s3Url}`);
    return s3Url;
  } catch (error: any) {
    console.warn(`⚠️ Failed to migrate image ${url}: ${error.message}`);
    return url; // Fallback to original URL
  }
}

function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/id="[^"]*"/g, '')
    .replace(/<p>\s*‌\s*<\/p>/g, '')
    .replace(/<p><\/p>/g, '')
    .trim();
}

function parsePrice(price: string): number {
  if (!price) return 0;
  const cleaned = price.replace(/\s/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

async function main() {
  console.log('🚀 Starting Data Import with S3 Image Migration...');

  if (!process.env.AWS_S3_BUCKET || !process.env.AWS_REGION) {
    throw new Error('Missing AWS configuration in .env');
  }

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
    const imageUrl = await processImage(cat['Category Image'], 'categories');

    const created = await prisma.category.upsert({
      where: { slug: cat.Slug },
      update: {
        name: cat.Name,
        image: imageUrl,
        showInHomePage: cat['Show in Home']?.toUpperCase() === 'TRUE',
      },
      create: {
        name: cat.Name,
        slug: cat.Slug,
        image: imageUrl,
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

  let productCount = 0;
  for (const prod of productsData) {
    if (!prod.Slug || prod.Slug === 'ds') continue;

    const catId = categoryMap.get(prod['Catégorie']);
    if (!catId) {
      console.warn(
        `⚠️ Skipping product ${prod.Name}: Category ${prod['Catégorie']} not found.`,
      );
      continue;
    }

    // Process Main Image
    const mainImageUrl = await processImage(prod['Main Image'], 'products');

    // Process Multi Images
    const multiImagesRaw = prod['Multi Images']
      ? prod['Multi Images']
          .split(';')
          .map((img: string) => img.trim())
          .filter((img: string) => img)
      : [];

    const multiImages: string[] = [];
    for (const imgUrl of multiImagesRaw) {
      const s3Url = await processImage(imgUrl, 'products');
      if (s3Url) multiImages.push(s3Url);
    }

    await prisma.product.upsert({
      where: { slug: prod.Slug },
      update: {
        name: prod.Name,
        mainImage: mainImageUrl,
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
        mainImage: mainImageUrl,
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
    if (productCount % 10 === 0) {
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
