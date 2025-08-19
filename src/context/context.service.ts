import { Injectable, Logger } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { RequestContext } from './context.interface';

/**
 * Сервіс для управління контекстом запитів
 * Використовує AsyncLocalStorage для збереження контексту кожного запиту
 */
@Injectable()
export class ContextService {
  /** AsyncLocalStorage для збереження контексту запиту */
  private readonly als = new AsyncLocalStorage<RequestContext>();
  private readonly logger = new Logger(ContextService.name);

  /**
   * Встановлює контекст для поточного асинхронного виконання
   * @param context - Контекст запиту з ідентифікатором виконання
   */
  setContext(context: RequestContext): void {
    if (!context || !context.executionId) {
      throw new Error('Invalid context: executionId is required');
    }

    try {
      this.als.enterWith(context);
      this.logger.debug('Context set successfully', {
        executionId: context.executionId,
        service: 'ContextService',
        method: 'setContext',
      });
    } catch (error) {
      this.logger.error('Failed to set context', {
        error: error.message,
        executionId: context.executionId,
        service: 'ContextService',
        method: 'setContext',
      });
      throw error;
    }
  }

  /**
   * Отримує поточний контекст запиту
   * @returns Контекст запиту або undefined, якщо контекст не встановлено
   */
  getContext(): RequestContext | undefined {
    try {
      const context = this.als.getStore();

      if (context) {
        this.logger.debug('Context retrieved successfully', {
          executionId: context.executionId,
          service: 'ContextService',
          method: 'getContext',
        });
      } else {
        this.logger.debug('No context found', {
          service: 'ContextService',
          method: 'getContext',
        });
      }

      return context;
    } catch (error) {
      this.logger.error('Failed to get context', {
        error: error.message,
        service: 'ContextService',
        method: 'getContext',
      });
      return undefined;
    }
  }

  /**
   * Отримує ідентифікатор виконання з поточного контексту
   * @returns Ідентифікатор виконання або undefined, якщо контекст не встановлено
   */
  getExecutionId(): string | undefined {
    try {
      const context = this.getContext();
      const executionId = context?.executionId;

      if (executionId) {
        this.logger.debug('Execution ID retrieved successfully', {
          executionId,
          service: 'ContextService',
          method: 'getExecutionId',
        });
      } else {
        this.logger.debug('No execution ID found in context', {
          service: 'ContextService',
          method: 'getExecutionId',
        });
      }

      return executionId;
    } catch (error) {
      this.logger.error('Failed to get execution ID', {
        error: error.message,
        service: 'ContextService',
        method: 'getExecutionId',
      });
      return undefined;
    }
  }

  /**
   * Виконує функцію в контексті запиту
   * @param context - Контекст запиту
   * @param fn - Функція для виконання
   * @returns Результат виконання функції
   */
  runWithContext<T>(context: RequestContext, fn: () => T): T {
    if (!context || !context.executionId) {
      throw new Error('Invalid context: executionId is required');
    }

    try {
      this.logger.debug('Executing function with context', {
        executionId: context.executionId,
        service: 'ContextService',
        method: 'runWithContext',
      });

      const result = this.als.run(context, fn);

      this.logger.debug('Function executed successfully with context', {
        executionId: context.executionId,
        service: 'ContextService',
        method: 'runWithContext',
      });

      return result;
    } catch (error) {
      this.logger.error('Function execution failed with context', {
        error: error.message,
        executionId: context.executionId,
        service: 'ContextService',
        method: 'runWithContext',
      });
      throw error;
    }
  }

  /**
   * Перевіряє чи контекст активний
   * @returns true, якщо контекст активний, false - якщо ні
   */
  isContextActive(): boolean {
    try {
      const context = this.als.getStore();
      return !!context;
    } catch (error) {
      this.logger.error('Failed to check context status', {
        error: error.message,
        service: 'ContextService',
        method: 'isContextActive',
      });
      return false;
    }
  }

  /**
   * Очищає поточний контекст
   * @returns true, якщо контекст був очищений, false - якщо ні
   */
  clearContext(): boolean {
    try {
      const context = this.als.getStore();
      if (context) {
        this.als.disable();
        this.logger.debug('Context cleared successfully', {
          executionId: context.executionId,
          service: 'ContextService',
          method: 'clearContext',
        });
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Failed to clear context', {
        error: error.message,
        service: 'ContextService',
        method: 'clearContext',
      });
      return false;
    }
  }
}
