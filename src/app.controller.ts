import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ContextService } from './context/context.service';

/**
 * Головний контролер додатку
 * Надає єдину точку входу для отримання ідентифікатора виконання запиту
 */
@Controller()
export class AppController {
  private readonly startTime: number;

  constructor(private readonly contextService: ContextService) {
    this.startTime = Date.now();
  }

  /**
   * GET endpoint для отримання ідентифікатора виконання поточного запиту
   * @returns Об'єкт з ідентифікатором виконання
   * @throws HttpException якщо ідентифікатор виконання не знайдено в контексті
   */
  @Get()
  getExecutionId(): { executionId: string } {
    const executionId = this.contextService.getExecutionId();

    if (!executionId) {
      throw new HttpException(
        'Execution ID not found in context',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { executionId };
  }

  /**
   * GET endpoint для перевірки стану здоров'я додатку
   * @returns Об'єкт з інформацією про стан додатку
   */
  @Get('health')
  getHealth(): {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
    memory: {
      used: number;
      total: number;
      free: number;
      external: number;
    };
    system: {
      platform: string;
      nodeVersion: string;
      pid: number;
      cpuUsage: number;
    };
    context: {
      active: boolean;
      executionId?: string;
    };
  } {
    try {
      const uptime = Date.now() - this.startTime;
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      // Get current context status
      const currentContext = this.contextService.getContext();
      const currentExecutionId = this.contextService.getExecutionId();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime / 1000), // Convert to seconds
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          free: Math.round(
            (memoryUsage.heapTotal - memoryUsage.heapUsed) / 1024 / 1024,
          ), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        },
        system: {
          platform: process.platform,
          nodeVersion: process.version,
          pid: process.pid,
          cpuUsage: Math.round((cpuUsage.user + cpuUsage.system) / 1000), // ms
        },
        context: {
          active: !!currentContext,
          executionId: currentExecutionId,
        },
      };
    } catch (error) {
      throw new HttpException(
        'Health check failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
