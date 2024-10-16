import { Controller, Inject, Logger } from '@nestjs/common';
import { ClientProxy, Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CarServiceService } from './car-service.service';

@Controller('car-service')
export class CarServiceController {
    constructor(private readonly carService: CarServiceService) { }
    @MessagePattern({ cmd: 'process_car_damage' })
    getNotifications(@Payload() data: any, @Ctx() context: RmqContext) {
        return this.carService.processor(data)
    }
}
