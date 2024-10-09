import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ApiGatewayService {
    constructor(@Inject('CAR_DAMAGE_CLIENT') private readonly aiService1Client: ClientProxy) { }


    carDamageController(apikey){
            this.aiService1Client.send({cmd:"car-damage"}, apikey)
    }
}
