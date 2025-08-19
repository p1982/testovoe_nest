import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { ContextService } from '../context/context.service';
import { RequestContext } from '../context/context.interface';

/**
 * Сервіс для виконання cron завдань
 * Запускає завдання з конфігурованим інтервалом та унікальним ідентифікатором виконання
 */
@Injectable()
export class CronService {
  /** Логер для запису інформації про виконання cron завдань */
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly contextService: ContextService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Cron завдання, яке виконується з конфігурованим інтервалом
   * Генерує унікальний ідентифікатор виконання та логує його
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  handleCronJob(): void {
    const startTime = Date.now();
    const executionId = uuidv4();

    try {
      // Перевіряємо чи cron завдання увімкнено
      if (!this.configService.get<boolean>('cron.enabled')) {
        this.logger.debug('Cron job disabled in configuration', {
          executionId,
          service: 'CronService',
          method: 'handleCronJob',
        });
        return;
      }

      // Генеруємо унікальний ідентифікатор виконання для cron завдання
      const context: RequestContext = { executionId };

      // Виконуємо завдання в контексті з ідентифікатором виконання
      this.contextService.runWithContext(context, () => {
        const retrievedExecutionId = this.contextService.getExecutionId();
        const interval = this.configService.get<number>('cron.interval');
        const timezone = this.configService.get<string>('cron.timezone');

        const executionTime = Date.now() - startTime;

        // Структуроване логування з метаданими
        this.logger.log('Cron job executed successfully', {
          executionId: retrievedExecutionId,
          service: 'CronService',
          method: 'handleCronJob',
          interval,
          timezone,
          executionTimeMs: executionTime,
          timestamp: new Date().toISOString(),
          memoryUsage: this.getMemoryUsage(),
        });

        // Додаткове логування для моніторингу продуктивності
        if (executionTime > 1000) {
          // Log warning if execution takes more than 1 second
          this.logger.warn('Cron job execution time exceeded threshold', {
            executionId: retrievedExecutionId,
            executionTimeMs: executionTime,
            thresholdMs: 1000,
          });
        }
      });
    } catch (error) {
      const executionTime = Date.now() - startTime;

      this.logger.error('Cron job execution failed', {
        executionId,
        service: 'CronService',
        method: 'handleCronJob',
        error: error.message,
        stack: error.stack,
        executionTimeMs: executionTime,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Отримує інформацію про використання пам'яті
   * @returns Об'єкт з інформацією про пам'ять
   */
  private getMemoryUsage(): {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  } {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      rss: Math.round(usage.rss / 1024 / 1024), // MB
    };
  }
}
