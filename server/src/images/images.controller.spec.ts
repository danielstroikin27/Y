import { Test, TestingModule } from '@nestjs/testing';
import { ImagesController } from './images.controller';
import { MinioService } from '../storage/minio.service';
import { MinioModule } from 'src/storage/storage.module';
import { ImagesService } from './images.service';

describe('ImagesController', () => {
  let controller: ImagesController;

  beforeEach(async () => {
    const mockMinioService = {
      uploadFile: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
      providers: [
        {
          provide: MinioService,
          useValue: mockMinioService
        },
        {provide:ImagesService, useValue: {}}
      ],
      imports: [
        MinioModule
      ]
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
