import { Test, TestingModule } from '@nestjs/testing';
import { CarServiceController } from './car-service.controller';

describe('CarServiceController', () => {
  let controller: CarServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarServiceController],
    }).compile();

    controller = module.get<CarServiceController>(CarServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
