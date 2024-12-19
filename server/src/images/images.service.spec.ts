import { Test, TestingModule } from '@nestjs/testing';
import { ImagesService } from './images.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { MinioService } from '../storage/minio.service';
import { ConfigService } from '@nestjs/config';

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

  // Updated mock repository
  const mockImageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  // Add new mock services
  const mockMinioService = {
    statObject: jest.fn(),
    getFileStream: jest.fn(),
    uploadFile: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        {
          provide: getRepositoryToken(Image),
          useValue: mockImageRepository,
        },
        {
          provide: MinioService,
          useValue: mockMinioService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    // Initialize mocks with default responses
    mockImageRepository.create.mockReturnValue({ id: 1 });
    mockImageRepository.save.mockResolvedValue({ id: 1 });
    mockMinioService.uploadFile.mockResolvedValue('test-url');
    mockConfigService.get.mockReturnValue('http://localhost:3000');

    service = module.get<ImagesService>(ImagesService);
  });

  describe('uploadImage', () => {
    it('should successfully upload an image', async () => {
      const result = await service.uploadImage(mockFile, 60);
      
      expect(result).toBeDefined();
      expect(result.url).toBeDefined();
    });
  });

  describe('getImage', () => {
    it('should successfully retrieve an image', async () => {
      // Mock DB response
      const mockImage = {
        id: '123',
        filename: 'test-image.jpg',
        mimeType: 'image/jpeg',
        expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
      };
      mockImageRepository.findOne.mockResolvedValue(mockImage);

      // Mock MinIO responses
      const mockStream = { pipe: jest.fn() }; // Mock readable stream
      mockMinioService.statObject.mockResolvedValue({});
      mockMinioService.getFileStream.mockResolvedValue(mockStream);

      const result = await service.getImage('123');

      expect(result).toEqual({
        stream: mockStream,
        type: 'image/jpeg'
      });
      expect(mockMinioService.statObject).toHaveBeenCalledWith('test-image.jpg');
      expect(mockMinioService.getFileStream).toHaveBeenCalledWith('test-image.jpg');
    });

    it('should throw NotFoundException when image not found in DB', async () => {
      mockImageRepository.findOne.mockResolvedValue(null);

      await expect(service.getImage('123')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException and cleanup DB when file expired in MinIO', async () => {
      const mockImage = {
        id: '123',
        filename: 'test-image.jpg',
        mimeType: 'image/jpeg',
        expiresAt: new Date(Date.now() - 3600000) // 1 hour ago
      };
      mockImageRepository.findOne.mockResolvedValue(mockImage);
      mockMinioService.statObject.mockRejectedValue(new NotFoundException());

      await expect(service.getImage('123')).rejects.toThrow('Image has expired');
      expect(mockImageRepository.remove).toHaveBeenCalledWith(mockImage);
    });
  });
});
