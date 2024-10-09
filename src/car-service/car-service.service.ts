import { Injectable } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Injectable()
export class CarServiceService {
    @MessagePattern({ cmd: 'car-damage' })
    carDamage(data: any) {
        console.log('ai', data)
    }
}
