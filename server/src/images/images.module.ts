import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
@Module({
  controllers: [ImagesController],
  providers: [ImagesService],
  imports: [TypeOrmModule.forFeature([Image])],
  exports: [ImagesService]
})
export class ImagesModule {}
