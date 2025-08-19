import { Injectable } from '@nestjs/common';
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

  /**
   * Встановлює контекст для поточного асинхронного виконання
   * @param context - Контекст запиту з ідентифікатором виконання
   */
  setContext(context: RequestContext): void {
    this.als.enterWith(context);
  }

  /**
   * Отримує поточний контекст запиту
   * @returns Контекст запиту або undefined, якщо контекст не встановлено
   */
  getContext(): RequestContext | undefined {
    return this.als.getStore();
  }

  /**
   * Отримує ідентифікатор виконання з поточного контексту
   * @returns Ідентифікатор виконання або undefined, якщо контекст не встановлено
   */
  getExecutionId(): string | undefined {
    const context = this.getContext();
    return context?.executionId;
  }

  /**
   * Виконує функцію в контексті запиту
   * @param context - Контекст запиту
   * @param fn - Функція для виконання
   * @returns Результат виконання функції
   */
  runWithContext<T>(context: RequestContext, fn: () => T): T {
    return this.als.run(context, fn);
  }
}
