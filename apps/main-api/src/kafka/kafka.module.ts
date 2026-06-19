import { Module } from '@nestjs/common';

import { KafkaService } from './kafka.service';
import { KafkaController } from './kafka.controller';
import { KafkaConsumerService } from './kafka-consumer.service';

@Module({
  controllers: [KafkaController],
  providers: [KafkaService, KafkaConsumerService],
  exports: [KafkaService],
})
export class KafkaModule {}
