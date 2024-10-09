import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { AuthService } from './auth/auth.service';
import { CustomersModule } from './customers/customers.module';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core/constants';
import { AppGuard, } from './auth/auth.guard';
import { ApiGatewayModule } from './api-gateway/api-gateway.module';
import { PlansModule } from './plans/plans.module';
import { CarServiceModule } from './car-service/car-service.module';

@Module({
  imports: [RabbitMQModule.forRoot(RabbitMQModule, {
    exchanges: [
      {
        name: 'my_exchange',
        type: 'topic',
      },
    ],
    uri: 'amqp://ai:123321@localhost:5672',
    connectionInitOptions: { wait: false },
  }), , ConfigModule.forRoot({
    envFilePath: '.development.env',
    isGlobal: true,
    load: [configuration],
  }), DatabaseModule, AuthModule, CustomersModule, ApiGatewayModule, PlansModule, CarServiceModule],
  controllers: [],
  providers: [AuthService, JwtService, {
    provide: APP_GUARD,
    useClass: AppGuard,
  },],
})

export class AppModule {

}