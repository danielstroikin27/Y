import { Test, TestingModule } from '@nestjs/testing';
import { ImagesController } from './images.controller';
import { MinioService } from '../storage/minio.service';
import { ImagesService } from './images.service';

describe('ImagesController', () => {
  let controller: ImagesController;
  let minioService: jest.Mocked<MinioService>;
  let imagesService: jest.Mocked<ImagesService>;

  beforeEach(async () => {
    const mockMinioService = {
      uploadFile: jest.fn(),
      getFile: jest.fn(),
      deleteFile: jest.fn(),
    };

    const mockImagesService = {
      uploadImage: jest.fn(),
      getImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [
        {
          provide: MinioService,
          useValue: mockMinioService
        },
        {
          provide: ImagesService,
          useValue: mockImagesService
        }
      ],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
    minioService = module.get(MinioService);
    imagesService = module.get(ImagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Add more test cases here based on your controller methods
  // For example:
  describe('uploadImage', () => {
    it('should upload an image successfully', async () => {
      const mockFile = { buffer: Buffer.from('test'), originalname: 'test.jpg' };
      const mockResponse = { id: 1, url: 'uploaded-url' };
      
      imagesService.uploadImage.mockResolvedValue(mockResponse);

      const result = await controller.uploadImage(mockFile as Express.Multer.File, { minutes: 60 });

      expect(imagesService.uploadImage).toHaveBeenCalledWith(mockFile, 60);
      expect(result).toEqual(mockResponse);
    });
  });
});
