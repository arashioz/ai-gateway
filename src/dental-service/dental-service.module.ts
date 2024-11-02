import { Module } from '@nestjs/common';
import { DentalServiceController } from './dental-service.controller';
import { DentalServiceService } from './dental-service.service';
import { DatabaseModule } from 'src/database/database.module';
import { HttpModule } from '@nestjs/axios';
import { CarServiceService } from 'src/car-service/car-service.service';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [HttpModule,DatabaseModule
  ],
  providers: [DentalServiceService,
    {
      provide: 'DENTAL_CLIENT',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: ['amqp://ai:123321@localhost:5672/'],
            queue: 'ai_queue_dental',
            queueOptions: {
              durable: true,
            },
          },
        });
      },
    }

  ],
  exports: ['DENTAL_CLIENT', DentalServiceService],
  controllers: [DentalServiceController]

})
export class DentalServiceModule { }
