import { Module } from '@nestjs/common';
import { CarServiceService } from './car-service.service';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  providers: [CarServiceService,
    {
      provide: 'CAR_DAMAGE_CLIENT',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://localhost:5672'],
            queue: 'ai_queue',
            queueOptions: {
              durable: false,
            },
          },
        });
      },
    }

  ],
  exports: ['CAR_DAMAGE_CLIENT',]

})
export class CarServiceModule { }
