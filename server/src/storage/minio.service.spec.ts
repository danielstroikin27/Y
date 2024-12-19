import { Test, TestingModule } from '@nestjs/testing';
import { MinioService } from '../storage/minio.service';
import { BadRequestException } from '@nestjs/common';
import { of } from 'rxjs';
import { MinioInterceptor } from '../interceptors/minio.interceptor';

describe('MinioInterceptor', () => {
  let interceptor: MinioInterceptor;
  let minioService: MinioService;

  const mockMinioService = {
    uploadFile: jest.fn()
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

  it('should successfully upload file and set filename', (done) => {
    const mockFile = {
      originalname: 'test.jpg',
      buffer: Buffer.from('test')
    };
    const mockFileName = 'uploaded-test.jpg';
    const mockRequest = {
      file: mockFile
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

    interceptor.intercept(mockContext as any, mockCallHandler as any).subscribe({
      next: (value) => {
        expect(value).toEqual({ success: true });
        expect(mockRequest['uploadedFile']).toEqual({ filename: mockFileName });
        expect(minioService.uploadFile).toHaveBeenCalledWith(mockFile);
      },
      complete: () => done()
    });
  });

  it('should throw BadRequestException when no file is provided', (done) => {
    const mockRequest = {};
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest
      })
    };
    const mockCallHandler = {
      handle: () => of({ success: true })
    };

    interceptor.intercept(mockContext as any, mockCallHandler as any).subscribe({
      error: (error) => {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('No file provided');
        done();
      }
    });
  });

  it('should handle upload errors', (done) => {
    const mockFile = {
      originalname: 'test.jpg',
      buffer: Buffer.from('test')
    };
    const mockRequest = {
      file: mockFile
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest
      })
    };
    const mockCallHandler = {
      handle: () => of({ success: true })
    };

    const mockError = new Error('Upload failed');
    mockMinioService.uploadFile.mockRejectedValue(mockError);

    interceptor.intercept(mockContext as any, mockCallHandler as any).subscribe({
      error: (error) => {
        expect(error).toBe(mockError);
        done();
      }
    });
  });
});
