import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Client;
  private readonly BUCKET_NAME = 'images';
  private readonly EXPIRATION_MINUTES = 60;

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
  }

  async uploadFile(file: Express.Multer.File, minutes: number): Promise<string> {
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds the limit of 5MB');
    }

    const fileName = `${randomUUID()}-${file.originalname}`;
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + Number(minutes));
    
    await this.minioClient.putObject(
      this.BUCKET_NAME,
      fileName,
      file.buffer,
      file.size,
      {
        'Content-Type': file.mimetype,
        'X-Expiration-Time': expirationTime.toISOString(),
      }
    );

    return fileName;
  }

  async getFileStream(fileName: string): Promise<NodeJS.ReadableStream> {
    try {
      const stat = await this.minioClient.statObject(this.BUCKET_NAME, fileName);
      const expirationTime = new Date(stat.metaData['x-expiration-time']);
      
      if (expirationTime < new Date()) {
        throw new NotFoundException('File has expired');
      }
      
      return await this.minioClient.getObject(this.BUCKET_NAME, fileName);
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new NotFoundException('File not found');
      }
      throw error;
    }
  }

  async statObject(fileName: string): Promise<void> {
    try {
      const stat = await this.minioClient.statObject(this.BUCKET_NAME, fileName);
      const expirationTime = new Date(stat.metaData['x-expiration-time']);
      
      if (expirationTime < new Date()) {
        throw new NotFoundException('File has expired');
      }
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new NotFoundException('File not found');
      }
      throw error;
    }
  }

  // Add cron job to delete expired files
  @Cron(CronExpression.EVERY_MINUTE)
  async deleteExpiredFiles() {
    const bucketStream = await this.minioClient.listObjects(this.BUCKET_NAME, '', true);
    for await (const file of bucketStream) {
      const stat = await this.minioClient.statObject(this.BUCKET_NAME, file.name);
      const expirationTime = new Date(stat.metaData['x-expiration-time']);
      if (expirationTime < new Date()) {
        await this.minioClient.removeObject(this.BUCKET_NAME, file.name);
      }
    }
  }
}
