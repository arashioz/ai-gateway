import { Test, TestingModule } from '@nestjs/testing';
import { DentalServiceService } from './dental-service.service';

describe('DentalServiceService', () => {
  let service: DentalServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DentalServiceService],
    }).compile();

    service = module.get<DentalServiceService>(DentalServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
