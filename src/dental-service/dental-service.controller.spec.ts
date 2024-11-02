import { Test, TestingModule } from '@nestjs/testing';
import { DentalServiceController } from './dental-service.controller';

describe('DentalServiceController', () => {
  let controller: DentalServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DentalServiceController],
    }).compile();

    controller = module.get<DentalServiceController>(DentalServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
