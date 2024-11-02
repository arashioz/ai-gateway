import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from 'src/database/database.module';
import { CarServiceModule } from 'src/car-service/car-service.module';
import { DentalServiceModule } from 'src/dental-service/dental-service.module';

@Module({
  imports: [
    DatabaseModule,
    CarServiceModule,
    DentalServiceModule
  ],
  providers: [],
  controllers: [ApiGatewayController]
})
export class ApiGatewayModule { }
