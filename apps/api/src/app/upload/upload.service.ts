import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('AWS_S3_BUCKET');
    this.region = this.configService.getOrThrow<string>('AWS_REGION');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
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
      const fileExtension = 'jpg';
      const fileName = `${randomUUID()}.${fileExtension}`;
      const key = `${folder}/${fileName}`;

      // Upload to S3
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: optimizedBuffer,
          ContentType: 'image/jpeg',
        },
      });

      await upload.done();

      // Return public URL
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    } catch (error) {
      this.logger.error('Error uploading image to S3', error);
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
      // Extract key from URL
      // URL format: https://BUCKET.s3.REGION.amazonaws.com/FOLDER/FILENAME
      const urlObj = new URL(imageUrl);
      // Pathname will be /FOLDER/FILENAME (with leading slash)
      const key = urlObj.pathname.substring(1); // Remove leading slash

      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error('Error deleting image from S3', error);
      // Don't throw error - image might already be deleted or URL format mismatch
    }
  }
}
