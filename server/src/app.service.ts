import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🖼️ Y - Image Sharing App!';
  }
}
