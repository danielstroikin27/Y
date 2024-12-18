import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import * as fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ImagesService {
    constructor(
        @InjectRepository(Image)
        private readonly imageRepository: Repository<Image>) { }
    
     public getImage(imageId: string) {
        return this.imageRepository.findOne({ where: { id: imageId } });
    }

    public async uploadImage(file: Express.Multer.File, expirationDate?: Date) {
        const image = new Image();
        image.filename = file.filename;
        image.mimeType = file.mimetype;
        image.expiresAt = new Date(expirationDate ?? this.getExpirationDate()); // 1 day default
        image.path = file.path;
        
        return this.imageRepository.save(image);
    }

    public async deleteImage(id: string) {
        return this.imageRepository.delete(id);
    }

    private getExpirationDate() {
        return process.env.EXPIRATION_TIME ? Date.now() + 1000 * Number(process.env.EXPIRATION_TIME) : Date.now() + 1000 * 60 * 60 * 24; // 1 day default
    }
}
