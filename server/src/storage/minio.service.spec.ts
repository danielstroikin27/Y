import { Test, TestingModule } from '@nestjs/testing';
import { MinioService } from '../storage/minio.service';
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { of, firstValueFrom } from 'rxjs';
import { MinioInterceptor } from '../interceptors/minio.interceptor';

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

describe('MinioInterceptor', () => {
  let interceptor: MinioInterceptor;
  let minioService: MinioService;

  const mockMinioService = {
    uploadFile: jest.fn(),
    deleteExpiredFiles: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioInterceptor,
        {
          provide: MinioService,
          useValue: mockMinioService
        }
      ],
    }).compile();

    interceptor = module.get<MinioInterceptor>(MinioInterceptor);
    minioService = module.get<MinioService>(MinioService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should successfully upload file and set filename', async () => {
    const mockFile = {
      originalname: 'test.jpg',
      buffer: Buffer.from('test'),
      fieldname: 'file',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024
    };
    const mockFileName = 'uploaded-test.jpg';
    const mockRequest = {
      file: mockFile,
      headers: {
        'content-type': 'multipart/form-data'
      },
      body: {
        minutes: 60
      }
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest
      })
    };
    const mockCallHandler = {
      handle: () => of({ success: true })
    };

    mockMinioService.uploadFile.mockResolvedValue(mockFileName);

    const result = await firstValueFrom(
      interceptor.intercept(mockContext as any, mockCallHandler as any)
    );
    
    expect(result).toEqual({ success: true });
    expect((mockRequest.file as any).filename).toEqual(mockFileName);
    expect(minioService.uploadFile).toHaveBeenCalledWith(mockFile, 60);
  });

  it('should throw BadRequestException for file size exceeding limit', async () => {
    const largeFile = { ...mockFile, size: 5 * 1024 * 1024 + 1 }; // > 5MB
    
    mockMinioService.uploadFile.mockRejectedValue(new BadRequestException('File too large'));
    
    await expect(minioService.uploadFile(largeFile, 60)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when file is not a valid image', async () => {
    const mockRequest = {
      file: {
        ...mockFile,
        mimetype: 'application/pdf'
      },
      headers: {
        'content-type': 'multipart/form-data'
      }
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest
      })
    };
    const mockCallHandler = {
      handle: () => of({ success: true })
    };

    await expect(
      firstValueFrom(interceptor.intercept(mockContext as any, mockCallHandler as any))
    ).rejects.toThrow(new UnprocessableEntityException('File is not an image'));
  });

  it('should throw BadRequestException when no file is provided', async () => {
    const mockRequest = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest
      })
    };
    const mockCallHandler = {
      handle: () => of({ success: true }) 
    };

    await expect(
      firstValueFrom(interceptor.intercept(mockContext as any, mockCallHandler as any))
    ).rejects.toThrow(new BadRequestException('No file provided'));
  });

  it('should delete expired files', async () => {
    const mockExpiredFiles = [
      {
        name: 'expired-file-1.jpg',
        metaData: { 'x-expiration-time': new Date(Date.now() - 1000).toISOString() }
      },
      {
        name: 'expired-file-2.jpg',
        metaData: { 'x-expiration-time': new Date(Date.now() - 3600000).toISOString() }
      }
    ];

    mockMinioService.deleteExpiredFiles.mockResolvedValue(mockExpiredFiles);

    await minioService.deleteExpiredFiles();

    expect(mockMinioService.deleteExpiredFiles).toHaveBeenCalled();
  });
});

