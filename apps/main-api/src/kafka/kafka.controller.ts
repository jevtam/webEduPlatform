import { Controller, Post } from '@nestjs/common';

import { KafkaService } from './kafka.service';

@Controller('kafka')
export class KafkaController {
  constructor(private readonly kafkaService: KafkaService) {}

  @Post('test')
  async test() {
    await this.kafkaService.emit('image.uploaded', {
      type: 'test',
      message: 'Hello from Main API',
      createdAt: new Date().toISOString(),
    });

    return {
      message: 'Kafka test event sent',
    };
  }
}
