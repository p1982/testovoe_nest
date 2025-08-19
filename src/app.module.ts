import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { ContextModule } from './context/context.module';
import { CronModule } from './cron/cron.module';
import { AppConfigModule } from './config/config.module';
import { ContextMiddleware } from './context/context.middleware';

/**
 * Головний модуль додатку
 * Налаштовує всі необхідні модулі та middleware для роботи додатку
 */
@Module({
  imports: [AppConfigModule, ContextModule, CronModule],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  /**
   * Налаштовує middleware для всіх маршрутів
   * ContextMiddleware автоматично створює контекст для кожного запиту
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware).forRoutes('*');
  }
}
