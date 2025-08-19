import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

/**
 * Головна функція для запуску додатку
 * Створює та запускає NestJS додаток з конфігурацією з змінних середовища
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');

  await app.listen(port);
  console.log(`Application started on: http://localhost:${port}`);
  console.log(`Environment: ${configService.get<string>('app.environment')}`);
}
bootstrap();
