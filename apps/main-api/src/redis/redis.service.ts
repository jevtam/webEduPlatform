import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: RedisClientType;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.client = createClient({
      socket: {
        host: this.configService.get<string>('REDIS_HOST') || 'localhost',
        port: Number(this.configService.get<string>('REDIS_PORT') || 6379),
      },
    });

    this.client.on('error', (error) => {
      console.error('Redis error:', error);
    });

    await this.client.connect();
    console.log('Redis connected');
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);

    console.log('REDIS GET:', key, value ? 'HIT' : 'MISS');

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  async set(key: string, value: unknown, ttlSeconds = 60) {
    console.log('REDIS SET:', key);

    await this.client.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  }

  async del(key: string) {
    await this.client.del(key);
  }
}
