import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Versioning
  app.enableVersioning({
    defaultVersion: VERSION_NEUTRAL,
    type: VersioningType.URI,
  });

  app.useGlobalPipes(new ValidationPipe());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('AI Gateway')
    .setDescription('The AI Gateway API')
    .setVersion('1.0')
    .addBearerAuth().addApiKey(
      {
        type: 'apiKey',
        name: 'gateway-api-key',
        in: 'header',
      },
      'gateway-api-key',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const rabbitMQConfig = {
    urls: ['amqp://ai:123321@localhost:5672/'],
    queue: 'ai_queue',
    queueOptions: {
      durable: true, // تنظیم به true
    },
  };


  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: rabbitMQConfig,
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.startAllMicroservices()
    .then(() => {
      Logger.log('Microservice connected to RabbitMQ');
      Logger.log(`API Gateway is running on http://localhost:${port}`);
      app.listen(port);
    })
    .catch(err => {
      Logger.error('Error starting microservice:', err);
    })


}

bootstrap();
