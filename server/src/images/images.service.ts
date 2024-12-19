import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { MinioService } from '../storage/minio.service';
import { ConfigService } from '@nestjs/config';

const PREFIX = '/v1/images';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    private minioService: MinioService,
    private configService: ConfigService
  ) {}

  async uploadImage(file: Express.Multer.File, minutes: number): Promise<{ url: string }> {
    const image = this.imageRepository.create({
      filename: file.filename,
      mimeType: file.mimetype,
      expiresAt: new Date(Date.now() + minutes * 60 * 1000)
    });

    await this.imageRepository.save(image);

    return {
      url: `${this.configService.get('API_URL')}${PREFIX}/${image.id}`
    };
  }

  async getImage(id: string): Promise<{ stream: NodeJS.ReadableStream; type: string }> {
    const image = await this.imageRepository.findOne({ 
      where: { id } 
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    try {
      // Check if file still exists in MinIO
      await this.minioService.statObject(image.filename);
      
      // Get the file stream
      const stream = await this.minioService.getFileStream(image.filename);
      return {
        stream,
        type: image.mimeType
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        // Clean up DB if file has expired
        await this.imageRepository.remove(image);
        throw new NotFoundException('Image has expired');
      }
      throw error;
    }
  }
}
