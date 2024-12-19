import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { MinioService } from 'src/storage/minio.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService, MinioService,ConfigService],
  imports: [TypeOrmModule.forFeature([Image])],
  exports: [ImagesService]
})
export class ImagesModule {}
