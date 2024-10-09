import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // versioning
  app.enableVersioning({
    defaultVersion: VERSION_NEUTRAL,
    type: VersioningType.URI,
  });

  app.useGlobalPipes(new ValidationPipe());
  //swagger 
  const config = new DocumentBuilder()
    .setTitle('AI Gateway')
    .setDescription('The ITTALIE - AI GATEWAY')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // microservice
  const rabbitMQConfig = {
    urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672'],
    queue: configService.get<string>('RABBITMQ_QUEUE') || 'default_queue',
    queueOptions: {
      durable: false, 
    },
    socketOptions: {
      heartbeatIntervalInSeconds: 10, 
    },
  };

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: rabbitMQConfig,
  });


  const port = configService.get<number>('PORT') || 3000;
  await app.startAllMicroservices();
  await app.listen(port);

  Logger.verbose(`API Gateway is running on http://localhost:${port}`);
  Logger.verbose(`RABITMQ is running on ${rabbitMQConfig.queue} | ${rabbitMQConfig.urls}`);
}

bootstrap();
