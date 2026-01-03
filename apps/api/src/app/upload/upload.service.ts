import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

@Injectable()
export class UploadService {
  private uploadDir = join(process.cwd(), 'uploads');
  private baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

  constructor() {
    this.ensureUploadDirExists();
  }

  private async ensureUploadDirExists() {
    const dirs = [
      this.uploadDir,
      join(this.uploadDir, 'products'),
      join(this.uploadDir, 'categories'),
    ];

    for (const dir of dirs) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
    }
  }

  async uploadImage(file: any, folder = 'products'): Promise<string> {
    try {
      // Optimize image with sharp (resize and compress)
      const optimizedBuffer = await sharp(file.buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Generate unique filename
      const fileExtension = 'jpg'; // Always save as JPEG after optimization
      const fileName = `${randomUUID()}.${fileExtension}`;
      const filePath = join(this.uploadDir, folder, fileName);

      // Save file to disk
      await writeFile(filePath, optimizedBuffer);

      // Return public URL
      return `${this.baseUrl}/uploads/${folder}/${fileName}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  async uploadMultipleImages(
    files: any[],
    folder = 'products',
  ): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folderName = urlParts[urlParts.length - 2];

      const filePath = join(this.uploadDir, folderName, fileName);

      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error - image might already be deleted
    }
  }
}
