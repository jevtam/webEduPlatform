import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private producer!: Producer;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const kafka = new Kafka({
      clientId:
        this.configService.get<string>('KAFKA_CLIENT_ID') || 'edu-platform',
      brokers: [
        this.configService.get<string>('KAFKA_BROKER') || 'localhost:9092',
      ],
    });

    this.producer = kafka.producer();
    await this.producer.connect();

    console.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async emit(topic: string, payload: unknown) {
    await this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(payload),
        },
      ],
    });
  }
}
