import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { DentalServiceService } from './dental-service.service';

@Controller('dental-service')
export class DentalServiceController {
    constructor(private readonly dentalService: DentalServiceService) { }
    @MessagePattern({ cmd: 'process_dental' })
    getNotifications(@Payload() data: any, @Ctx() context: RmqContext) {
        return this.dentalService.processor(data)
    }

}
