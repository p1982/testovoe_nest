/**
 * Конфігурація додатку
 * Визначає структуру та значення за замовчуванням для змінних середовища
 */
export default () => {
  // Validate required environment variables
  const requiredEnvVars = ['NODE_ENV'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`,
    );
  }

  return {
    // Конфігурація додатку
    app: {
      name: 'NestJS Context App',
      port: (() => {
        const port = parseInt(process.env.PORT, 10);
        return isNaN(port) ? 3000 : port;
      })(),
      environment: process.env.NODE_ENV || 'development',
      host: process.env.HOST || 'localhost',
    },

    // Конфігурація логування
    logging: {
      level: (() => {
        const level = process.env.LOG_LEVEL;
        return level && level.trim() !== '' ? level : 'info';
      })(),
      enableConsole: process.env.LOG_CONSOLE !== 'false',
      enableFile: process.env.LOG_FILE === 'true',
      logFile: process.env.LOG_FILE_PATH || 'logs/app.log',
    },

    // Конфігурація cron завдань
    cron: {
      enabled: process.env.CRON_ENABLED === 'true',
      interval: (() => {
        const interval = parseInt(process.env.CRON_INTERVAL, 10);
        return isNaN(interval) ? 30 : interval;
      })(),
      timezone: process.env.CRON_TIMEZONE || 'UTC',
    },

    // Конфігурація контексту
    context: {
      timeout: (() => {
        const timeout = parseInt(process.env.CONTEXT_TIMEOUT, 10);
        return isNaN(timeout) ? 30000 : timeout;
      })(),
      enableLogging: process.env.CONTEXT_LOGGING !== 'false',
      maxContextSize: (() => {
        const size = parseInt(process.env.CONTEXT_MAX_SIZE, 10);
        return isNaN(size) ? 1000 : size;
      })(),
    },

    // Конфігурація безпеки
    security: {
      enableCors: process.env.ENABLE_CORS !== 'false',
      corsOrigin: process.env.CORS_ORIGIN || '*',
      rateLimit: {
        enabled: process.env.RATE_LIMIT_ENABLED === 'true',
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
      },
    },
  };
};
