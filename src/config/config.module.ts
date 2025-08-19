import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';

/**
 * Модуль конфігурації
 * Завантажує змінні середовища та надає конфігурацію по всьому додатку
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),
  ],
})
export class AppConfigModule {} 