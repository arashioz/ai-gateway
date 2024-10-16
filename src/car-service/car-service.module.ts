import { Module } from '@nestjs/common';
import { CarServiceService } from './car-service.service';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { CarServiceController } from './car-service.controller';
import { DatabaseModule } from 'src/database/database.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule,  ],
  providers: [CarServiceService,
    DatabaseModule,
    {
      provide: 'CAR_DAMAGE_CLIENT',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://ai:123321@localhost:5672/'],
            queue: 'ai_queue',
            queueOptions: {
              durable: true,
            },
          },
        });
      },
    }

  ],
  exports: ['CAR_DAMAGE_CLIENT',],
  controllers: [CarServiceController]

})
export class CarServiceModule { }
