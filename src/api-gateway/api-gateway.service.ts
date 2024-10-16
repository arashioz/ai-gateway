import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ApiGatewayService {
    constructor(
        @Inject('CAR_DAMAGE_CLIENT') private readonly client: ClientProxy

    ) { }
    private readonly logger = new Logger(ApiGatewayService.name);

    carDamageController(apikey) {
        this.logger.log('Sending message to RabbitMQ...');
        this.client.send({ cmd: 'process_car_damage' }, "apikey")
            .subscribe({
                next: (response) => this.logger.log('Response from RabbitMQ:', response),
                error: (error) => this.logger.error('Error sending message:', error),
            });
    }
}
