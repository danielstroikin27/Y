import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as multer from 'multer';
import { MinioService } from '../storage/minio.service';


@Injectable()
export class MinioInterceptor implements NestInterceptor {
  constructor(private readonly minioService: MinioService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return new Observable((subscriber) => {
      const upload = multer({ storage: multer.memoryStorage() }).single('file');

      upload(request, undefined, async (err) => {
        if (err) {
          subscriber.error(new BadRequestException('File upload failed'));
          return;
        }

        try {
          const file = request.file;

          if (!file) {
            subscriber.error(new BadRequestException('No file provided'));
            return;
          }

          if (!file.mimetype.startsWith('image/')) {
            subscriber.error(new UnprocessableEntityException('File is not an image'));
            return;
          }

          const fileName = await this.minioService.uploadFile(file, request.body.minutes);

          request.file.filename= fileName;

          next.handle().subscribe({
            next: (value) => subscriber.next(value),
            error: (error) => subscriber.error(error),
            complete: () => subscriber.complete()
          });

        } catch (error) {
          subscriber.error(error);
        }
      });
    });
  }
}