import { Module } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { ApiGatewayController } from './api-gateway.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from 'src/database/database.module';
import { CarServiceModule } from 'src/car-service/car-service.module';

@Module({
  imports: [
    DatabaseModule,
    CarServiceModule,
  ],
  providers: [ApiGatewayService],
  controllers: [ApiGatewayController]
})
export class ApiGatewayModule { }
