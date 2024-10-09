export const rabbitMQConfig = {
    urls: ['amqp://localhost:5672'],
    queue: 'ai_queue',
    queueOptions: {
      durable: false,
    },
  };