import { Controller, Get, Post, Delete, Param, UploadedFile, Query, HttpException, HttpStatus, UseInterceptors } from '@nestjs/common';
import { ImagesService } from './images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('images')
export class ImagesController {
    constructor(private readonly imagesService: ImagesService) { }

    @Get(':imageId')
    getImage(@Param('imageId') imageId: string) { 
        return this.imagesService.getImage(imageId).catch(error => {
            throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
        });
    }

    @Post()
    @UseInterceptors(FileInterceptor('file',{storage:diskStorage({destination:'./uploads'})}))
    uploadImage(@UploadedFile() file: Express.Multer.File, @Param('expirationDate') expirationDate?: string) {
        return this.imagesService.uploadImage(file);
    }

    @Delete(':id')
    deleteImage(@Param('id') id: string) {
        return this.imagesService.deleteImage(id);
    }
}
