import { 
  Controller, 
  Get, 
  Param, 
  Post, 
  UseInterceptors, 
  ParseIntPipe,
  Res,
  StreamableFile,
  Req,
  UploadedFile,
  Body
} from '@nestjs/common';
import { Response } from 'express';
import { MinioInterceptor } from '../interceptors/minio.interceptor';
import { ImagesService } from './images.service';
import { Readable } from 'stream';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(MinioInterceptor)
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Body() body: { minutes: number }): Promise<{ url: string }> {
    return this.imagesService.uploadImage(file, body.minutes);
  }

  @Get(':id')
  async getImage(
    @Param('id') id: string, 
    @Res({ passthrough: true }) response: Response
  ): Promise<StreamableFile> {
    const { stream, type } = await this.imagesService.getImage(id);
    
    response.set({
      'Content-Type': type,
      'Content-Disposition': 'inline',
    });

    return new StreamableFile(stream as unknown as Readable);
  }
}
