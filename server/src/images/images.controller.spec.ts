import { Test, TestingModule } from '@nestjs/testing';
import { ImagesController } from './images.controller';

describe('ImagesController', () => {
  let controller: ImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImagesController],
    }).compile();

    controller = module.get<ImagesController>(ImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  
  // it('should return an image', async () => {
  //   const imageId = '123';
  //   const image = await controller.getImage(imageId);
  //   expect(image).toBeDefined();
  // });
});
