import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Client;
  private readonly BUCKET_NAME = 'images';
  private readonly EXPIRATION_DAYS = 7;

  constructor(private configService: ConfigService) {
    this.minioClient = new Client({
      endPoint: this.configService.get('MINIO_ENDPOINT'),
      port: parseInt(this.configService.get('MINIO_PORT')),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY'),
    });
  }

  async onModuleInit() {
    await this.setupBucket();
  }

  private async setupBucket() {
    const exists = await this.minioClient.bucketExists(this.BUCKET_NAME);
    if (!exists) {
      await this.minioClient.makeBucket(this.BUCKET_NAME);
    }

    const lifecycleConfig = {
      Rule: [
        {
          ID: 'expire-rule',
          Status: 'Enabled',
          Expiration: {
            Days: this.EXPIRATION_DAYS,
          },
        },
      ],
    };

    await this.minioClient.setBucketLifecycle(this.BUCKET_NAME, lifecycleConfig);
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${randomUUID()}-${file.originalname}`;
    
    await this.minioClient.putObject(
      this.BUCKET_NAME,
      fileName,
      file.buffer,
      file.size,
      {mimetype: file.mimetype}
    );

    return fileName;
  }

  async getFileStream(fileName: string): Promise<NodeJS.ReadableStream> {
    try {
      return await this.minioClient.getObject(this.BUCKET_NAME, fileName);
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new NotFoundException('File not found or has expired');
      }
      throw error;
    }
  }

  async statObject(fileName: string): Promise<void> {
    try {
      await this.minioClient.statObject(this.BUCKET_NAME, fileName);
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new NotFoundException('File not found or has expired');
      }
      throw error;
    }
  }
}
