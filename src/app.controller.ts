import { Controller, Get } from '@nestjs/common';
import { ContextService } from './context/context.service';

/**
 * Головний контролер додатку
 * Надає єдину точку входу для отримання ідентифікатора виконання запиту
 */
@Controller()
export class AppController {
  constructor(private readonly contextService: ContextService) {}

  /**
   * GET endpoint для отримання ідентифікатора виконання поточного запиту
   * @returns Об'єкт з ідентифікатором виконання
   * @throws Error якщо ідентифікатор виконання не знайдено в контексті
   */
  @Get()
  getExecutionId(): { executionId: string } {
    const executionId = this.contextService.getExecutionId();

    if (!executionId) {
      throw new Error('Execution ID not found in context');
    }

    return { executionId };
  }
}
