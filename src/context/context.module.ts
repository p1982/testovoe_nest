import { Module } from '@nestjs/common';
import { ContextService } from './context.service';
import { ContextMiddleware } from './context.middleware';

/**
 * Модуль контексту запитів
 * Надає сервіс для управління контекстом та middleware для автоматичного створення контексту
 */
@Module({
  providers: [ContextService, ContextMiddleware],
  exports: [ContextService],
})
export class ContextModule {}
