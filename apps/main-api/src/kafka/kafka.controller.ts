import { Controller, Post } from '@nestjs/common';

import { KafkaService } from './kafka.service';

@Controller('kafka')
export class KafkaController {
  constructor(private readonly kafkaService: KafkaService) {}

  @Post('test')
  async test() {
    await this.kafkaService.emit('image.uploaded', {
      entityType: 'course',
      entityId: 'test-course',
      field: 'cover',
      originalPath: '../../uploads/originals/test-cover.jpg',
      filename: 'test-cover.jpg',
    });

    return {
      message: 'Kafka image event sent',
    };
  }
}
