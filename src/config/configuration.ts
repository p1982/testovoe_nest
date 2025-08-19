/**
 * Конфігурація додатку
 * Визначає структуру та значення за замовчуванням для змінних середовища
 */
export default () => ({
  // Конфігурація додатку
  app: {
    name: 'NestJS Context App',
    port: (() => {
      const port = parseInt(process.env.PORT, 10);
      return isNaN(port) ? 3000 : port;
    })(),
    environment: process.env.NODE_ENV || 'development',
  },
  
  // Конфігурація логування
  logging: {
    level: (() => {
      const level = process.env.LOG_LEVEL;
      return level && level.trim() !== '' ? level : 'info';
    })(),
  },
  
  // Конфігурація cron завдань
  cron: {
    enabled: process.env.CRON_ENABLED === 'true',
    interval: (() => {
      const interval = parseInt(process.env.CRON_INTERVAL, 10);
      return isNaN(interval) ? 30 : interval;
    })(),
  },
  
  // Конфігурація контексту
  context: {
    timeout: (() => {
      const timeout = parseInt(process.env.CONTEXT_TIMEOUT, 10);
      return isNaN(timeout) ? 30000 : timeout;
    })(),
  },
}); 