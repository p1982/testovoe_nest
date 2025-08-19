import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ContextService } from './context.service';
import { RequestContext } from './context.interface';

/**
 * Middleware для автоматичного створення контексту запиту
 * Генерує унікальний ідентифікатор виконання для кожного HTTP запиту
 */
@Injectable()
export class ContextMiddleware implements NestMiddleware {
  constructor(private readonly contextService: ContextService) {}

  /**
   * Обробляє кожен HTTP запит
   * Створює унікальний ідентифікатор виконання та встановлює контекст
   */
  use(req: Request, res: Response, next: NextFunction): void {
    // Генеруємо унікальний ідентифікатор виконання для запиту
    const executionId = uuidv4();
    const context: RequestContext = { executionId };
    
    // Виконуємо наступний middleware в контексті запиту
    this.contextService.runWithContext(context, () => {
      next();
    });
  }
} 