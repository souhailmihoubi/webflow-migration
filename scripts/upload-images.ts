import 'dotenv/config';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import axios from 'axios';
import sharp from 'sharp';
import * as path from 'path';

// Init S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});
const bucketName = process.env.AWS_S3_BUCKET || '';

// List of images to upload
const imagesToUpload = [
  'https://cdn.prod.website-files.com/656da3bc4abd712dfd496d96/656dac8c4e7b2307f885151a_DSC_0090.jpg',
  'https://cdn.prod.website-files.com/656da3bc4abd712dfd496d96/656da85c79de230b4a6ff78a_Asset%202.png',
  'https://cdn.prod.website-files.com/656da3bc4abd712dfd496d96/65d097722b3b1167cc4806a4_656da3bd4abd712dfd496e1d_hero-light.jpg',
  'https://cdn.prod.website-files.com/656da3bc4abd712dfd496d96/65c755a6723f67efc2866d77_pexels-gabriela-pons-7851904.jpg',
  'https://cdn.prod.website-files.com/656da3bc4abd712dfd496d96/65c7548330490ffb8bb7b0b9_pexels-martin-p%C3%A9chy-1866149.jpg',
  'https://cdn.prod.website-files.com/656da3bc4abd712dfd496d96/65be1cf0ae53a965cedbcf27_living-room-2732939_1920.jpg',
  'https://cdn.prod.website-files.com/656da3bc4abd712dfd496d96/657aefaf5435c9e049407eb2_342527715_176869771524374_229913349902711703_n.jpg',
  'https://cdn.prod.website-files.com/656da3bc4abd712dfd496d96/657c556d26e923fa29986b57_339335480_670349011516505_1322316016790784753_n.jpg',
  'https://cdn.prod.website-files.com/656da3bc4abd712dfd496d96/656ddbadd58e2008d46f6d18_fast-delivery.png',
  'https://cdn.prod.website-files.com/656da3bc4abd712dfd496d96/656de15b7f7625f949bbc049_24-hours-support.png',
  'https://cdn.prod.website-files.com/656da3bc4abd712dfd496d96/656de20129b4a00cba3e4a3d_fiber.png',
  'https://cdn.prod.website-files.com/656da3bc4abd712dfd496d96/65bb83f104e108ea9f725fb6_sewing.png',
  'https://cdn.prod.website-files.com/656da3bc4abd712dfd496d96/65bb84c092fad943012e53db_diamond.png',
  'https://cdn.prod.website-files.com/656da3bc4abd712dfd496d96/65bb8480b6776557d6917911_modern-art.png',
  'https://cdn.prod.website-files.com/656da3bc4abd712dfd496d96/65bb8504b33733af7cb6034f_shopping-bag.png',
];

function getFileNameFromUrl(url: string): string {
  const urlPath = new URL(url).pathname;
  const fileName = path.basename(urlPath);
  // Decode URL-encoded characters
  return decodeURIComponent(fileName);
}

function getFileExtension(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  return ext || '.jpg';
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return types[ext] || 'image/jpeg';
}

async function uploadImage(
  url: string,
  folder: string = 'webflow-assets',
): Promise<string> {
  const originalFileName = getFileNameFromUrl(url);
  const ext = getFileExtension(originalFileName);

  // Keep original extension for non-jpg files like PNGs (for transparency support)
  const isPng = ext === '.png';
  const outputExt = isPng ? '.png' : '.jpg';
  const baseName = path.basename(originalFileName, ext);
  const fileName = `${baseName}${outputExt}`;

  const key = `${folder}/${fileName}`;
  const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  try {
    // Check if file already exists in S3
    await s3Client.send(
      new HeadObjectCommand({ Bucket: bucketName, Key: key }),
    );
    console.log(`⏭️  Skipping existing image: ${key}`);
    return s3Url;
  } catch (error: any) {
    // If error is NotFound, proceed to upload
    if (error.name !== 'NotFound') {
      // Log other errors but continue
      console.log(
        `Note: HEAD request failed with ${error.name}, proceeding to upload...`,
      );
    }
  }

  try {
    console.log(`⬇️  Downloading: ${originalFileName}`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    let optimizedBuffer: Buffer;

    if (isPng) {
      // Optimize PNG while preserving transparency
      optimizedBuffer = await sharp(buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .png({ compressionLevel: 9 })
        .toBuffer();
    } else {
      // Convert to optimized JPEG
      optimizedBuffer = await sharp(buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    // Upload to S3
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: optimizedBuffer,
        ContentType: getContentType(outputExt),
      },
    });

    await upload.done();
    console.log(`✅ Uploaded to S3: ${s3Url}`);
    return s3Url;
  } catch (error: any) {
    console.error(`❌ Failed to upload ${originalFileName}: ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Webflow Image Upload to S3...\n');

  if (!process.env.AWS_S3_BUCKET || !process.env.AWS_REGION) {
    throw new Error(
      'Missing AWS configuration. Please ensure AWS_S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY are set in your .env file.',
    );
  }

  console.log(`📦 Target bucket: ${bucketName}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION}`);
  console.log(`📁 Folder: webflow-assets`);
  console.log(`🖼️  Images to upload: ${imagesToUpload.length}\n`);

  const results: { url: string; s3Url: string; status: 'success' | 'error' }[] =
    [];

  for (const url of imagesToUpload) {
    try {
      const s3Url = await uploadImage(url, 'webflow-assets');
      results.push({ url, s3Url, status: 'success' });
    } catch (error) {
      results.push({ url, s3Url: '', status: 'error' });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 UPLOAD SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter((r) => r.status === 'success');
  const failed = results.filter((r) => r.status === 'error');

  console.log(`\n✅ Successful: ${successful.length}/${imagesToUpload.length}`);

  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}/${imagesToUpload.length}`);
    console.log('\nFailed URLs:');
    failed.forEach((f) => console.log(`  - ${f.url}`));
  }

  console.log('\n📎 S3 URLs for successful uploads:');
  successful.forEach((s) => console.log(`  ${s.s3Url}`));

  console.log('\n✨ Upload process completed!');
}

main().catch((e) => {
  console.error('❌ Error during upload:', e);
  process.exit(1);
});
