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
    // Перевіряємо чи cron завдання увімкнено
    if (!this.configService.get<boolean>('cron.enabled')) {
      this.logger.debug('Cron job disabled in configuration');
      return;
    }

    // Генеруємо унікальний ідентифікатор виконання для cron завдання
    const executionId = uuidv4();
    const context: RequestContext = { executionId };
    
    // Виконуємо завдання в контексті з ідентифікатором виконання
    this.contextService.runWithContext(context, () => {
      const retrievedExecutionId = this.contextService.getExecutionId();
      const interval = this.configService.get<number>('cron.interval');
      this.logger.log(`Cron job executed with execution ID: ${retrievedExecutionId} (interval: ${interval} min)`);
    });
  }
} 