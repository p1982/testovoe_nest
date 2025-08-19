import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { ContextModule } from '../context/context.module';

/**
 * Модуль cron завдань
 * Налаштовує планувальник завдань та сервіс для їх виконання
 */
@Module({
  imports: [ScheduleModule.forRoot(), ContextModule],
  providers: [CronService],
})
export class CronModule {}
