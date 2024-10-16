import { Test, TestingModule } from '@nestjs/testing';
import { CarServiceService } from './car-service.service';

describe('CarServiceService', () => {
  let service: CarServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarServiceService],
    }).compile();

    service = module.get<CarServiceService>(CarServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
