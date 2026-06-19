import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const kafka = new Kafka({
      clientId:
        this.configService.get<string>('KAFKA_CLIENT_ID') ||
        'edu-platform-consumer',
      brokers: [
        this.configService.get<string>('KAFKA_BROKER') || 'localhost:9092',
      ],
    });

    const consumer = kafka.consumer({
      groupId: 'main-api-group',
    });

    await consumer.connect();

    await consumer.subscribe({
      topic: 'image.processed',
      fromBeginning: false,
    });

    console.log('Kafka consumer connected');
    console.log('Listening topic: image.processed');

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        console.log('Kafka message received');
        console.log('Topic:', topic);
        console.log('Value:', message.value?.toString());
      },
    });
  }
}
