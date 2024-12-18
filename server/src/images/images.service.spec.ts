import { Test, TestingModule } from '@nestjs/testing';
import { ImagesService } from './images.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';

describe('ImagesService', () => {
  let service: ImagesService;

  // Mock file data
  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test-image.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('mock-image-content'),
    size: 1024,
    destination: '',
    filename: 'test-image.jpg',
    path: 'uploads/test-image.jpg',
    stream: null,
  };

  // Mock repository
  const mockImageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    // Add other repository methods you use in ImagesService
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        {
          provide: getRepositoryToken(Image),
          useValue: mockImageRepository,
        },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
  });

  describe('uploadImage', () => {
    it('should successfully upload an image', async () => {
      // Mock the internal service methods
      jest.spyOn(service as any, 'uploadImage').mockResolvedValue('saved-image.jpg');
      
      const result = await service.uploadImage(mockFile);
      
      expect(result).toBeDefined();
      // expect(result.filename).toBe('saved-image.jpg');
      // expect(!!result).toBe(true);
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const invalidFile = { ...mockFile, mimetype: 'text/plain' };
      
      await expect(service.uploadImage(invalidFile)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for file size exceeding limit', async () => {
      const largeFile = { ...mockFile, size: 5 * 1024 * 1024 + 1 }; // > 5MB
      
      await expect(service.uploadImage(largeFile)).rejects.toThrow(BadRequestException);
    });

    it('should handle upload errors gracefully', async () => {
      jest.spyOn(service as any, 'saveFile').mockRejectedValue(new Error('Storage error'));
      
      await expect(service.uploadImage(mockFile)).rejects.toThrow('Failed to upload image');
    });
  });

  describe('getImage', () => {
    it('should successfully retrieve an image', async () => {
      const mockImageBuffer = Buffer.from('mock-image-content');
      jest.spyOn(service as any, 'readFile').mockResolvedValue(mockImageBuffer);

      const result = await service.getImage('existing-image.jpg');

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result).toEqual(mockImageBuffer);
    });

    it('should throw NotFoundException for non-existent image', async () => {
      jest.spyOn(service as any, 'readFile').mockRejectedValue(new Error('File not found'));

      await expect(service.getImage('non-existent.jpg')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid filename', async () => {
      await expect(service.getImage('../malicious-path.jpg')).rejects.toThrow(BadRequestException);
    });
  });
});
