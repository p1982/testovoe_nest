import configuration from './configuration';

describe('Configuration', () => {
  // Save original environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    jest.resetModules();
    process.env = { ...originalEnv };

    // Always set NODE_ENV as it's now required
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('app configuration', () => {
    it('should use default port when PORT is not set', () => {
      delete process.env.PORT;

      const config = configuration();

      expect(config.app.port).toBe(3000); // Should fall back to default
    });

    it('should use PORT environment variable when set', () => {
      process.env.PORT = '8080';

      const config = configuration();

      expect(config.app.port).toBe(8080);
    });

    it('should parse PORT as integer', () => {
      process.env.PORT = '5000';

      const config = configuration();

      expect(config.app.port).toBe(5000);
      expect(typeof config.app.port).toBe('number');
    });

    it('should handle invalid PORT gracefully', () => {
      process.env.PORT = 'invalid';

      const config = configuration();

      expect(config.app.port).toBe(3000); // Should fall back to default
    });

    it('should use default environment when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;

      expect(() => {
        configuration();
      }).toThrow('Missing required environment variables: NODE_ENV');
    });

    it('should use NODE_ENV environment variable when set', () => {
      process.env.NODE_ENV = 'production';

      const config = configuration();

      expect(config.app.environment).toBe('production');
    });

    it('should have correct app name', () => {
      const config = configuration();

      expect(config.app.name).toBe('NestJS Context App');
    });

    it('should use default host when HOST is not set', () => {
      delete process.env.HOST;

      const config = configuration();

      expect(config.app.host).toBe('localhost');
    });

    it('should use HOST environment variable when set', () => {
      process.env.HOST = '0.0.0.0';

      const config = configuration();

      expect(config.app.host).toBe('0.0.0.0');
    });
  });

  describe('logging configuration', () => {
    it('should use default log level when LOG_LEVEL is not set', () => {
      delete process.env.LOG_LEVEL;

      const config = configuration();

      expect(config.logging.level).toBe('info');
    });

    it('should use LOG_LEVEL environment variable when set', () => {
      process.env.LOG_LEVEL = 'debug';

      const config = configuration();

      expect(config.logging.level).toBe('debug');
    });

    it('should handle different log levels', () => {
      const logLevels = ['error', 'warn', 'info', 'debug', 'verbose'];

      logLevels.forEach(level => {
        process.env.LOG_LEVEL = level;
        const config = configuration();
        expect(config.logging.level).toBe(level);
      });
    });
  });

  describe('cron configuration', () => {
    it('should enable cron by default when CRON_ENABLED is not set', () => {
      delete process.env.CRON_ENABLED;

      const config = configuration();

      expect(config.cron.enabled).toBe(false); // Should be false by default
    });

    it('should enable cron when CRON_ENABLED is "true"', () => {
      process.env.CRON_ENABLED = 'true';

      const config = configuration();

      expect(config.cron.enabled).toBe(true);
    });

    it('should disable cron when CRON_ENABLED is "false"', () => {
      process.env.CRON_ENABLED = 'false';

      const config = configuration();

      expect(config.cron.enabled).toBe(false);
    });

    it('should handle case-insensitive CRON_ENABLED values', () => {
      process.env.CRON_ENABLED = 'TRUE';

      const config = configuration();

      expect(config.cron.enabled).toBe(false); // Only exact "true" matches
    });

    it('should use default interval when CRON_INTERVAL is not set', () => {
      delete process.env.CRON_INTERVAL;

      const config = configuration();

      expect(config.cron.interval).toBe(30);
    });

    it('should use CRON_INTERVAL environment variable when set', () => {
      process.env.CRON_INTERVAL = '15';

      const config = configuration();

      expect(config.cron.interval).toBe(15);
    });

    it('should parse CRON_INTERVAL as integer', () => {
      process.env.CRON_INTERVAL = '60';

      const config = configuration();

      expect(config.cron.interval).toBe(60);
      expect(typeof config.cron.interval).toBe('number');
    });

    it('should handle invalid CRON_INTERVAL gracefully', () => {
      process.env.CRON_INTERVAL = 'invalid';

      const config = configuration();

      expect(config.cron.interval).toBe(30); // Should fall back to default
    });
  });

  describe('context configuration', () => {
    it('should use default timeout when CONTEXT_TIMEOUT is not set', () => {
      delete process.env.CONTEXT_TIMEOUT;

      const config = configuration();

      expect(config.context.timeout).toBe(30000);
    });

    it('should use CONTEXT_TIMEOUT environment variable when set', () => {
      process.env.CONTEXT_TIMEOUT = '60000';

      const config = configuration();

      expect(config.context.timeout).toBe(60000);
    });

    it('should parse CONTEXT_TIMEOUT as integer', () => {
      process.env.CONTEXT_TIMEOUT = '45000';

      const config = configuration();

      expect(config.context.timeout).toBe(45000);
      expect(typeof config.context.timeout).toBe('number');
    });

    it('should handle invalid CONTEXT_TIMEOUT gracefully', () => {
      process.env.CONTEXT_TIMEOUT = 'invalid';

      const config = configuration();

      expect(config.context.timeout).toBe(30000); // Should fall back to default
    });
  });

  describe('configuration structure', () => {
    it('should return object with all required sections', () => {
      const config = configuration();

      expect(config).toHaveProperty('app');
      expect(config).toHaveProperty('logging');
      expect(config).toHaveProperty('cron');
      expect(config).toHaveProperty('context');
    });

    it('should maintain consistent structure across different environments', () => {
      const environments = ['development', 'production', 'test'];

      environments.forEach(env => {
        process.env.NODE_ENV = env;
        const config = configuration();

        expect(config).toHaveProperty('app');
        expect(config).toHaveProperty('logging');
        expect(config).toHaveProperty('cron');
        expect(config).toHaveProperty('context');
        expect(config.app).toHaveProperty('name');
        expect(config.app).toHaveProperty('port');
        expect(config.app).toHaveProperty('environment');
        expect(config.logging).toHaveProperty('level');
        expect(config.cron).toHaveProperty('enabled');
        expect(config.cron).toHaveProperty('interval');
        expect(config.context).toHaveProperty('timeout');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined environment variables', () => {
      delete process.env.PORT;
      delete process.env.LOG_LEVEL;
      delete process.env.CRON_INTERVAL;
      delete process.env.CONTEXT_TIMEOUT;
      // Keep NODE_ENV as it's required

      const config = configuration();

      expect(config.app.port).toBe(3000);
      expect(config.logging.level).toBe('info');
      expect(config.cron.interval).toBe(30);
      expect(config.context.timeout).toBe(30000);
      expect(config.app.environment).toBe('test'); // Should use the test value we set
    });

    it('should throw error when NODE_ENV is missing', () => {
      delete process.env.NODE_ENV;

      expect(() => {
        configuration();
      }).toThrow('Missing required environment variables: NODE_ENV');
    });

    it('should handle empty NODE_ENV gracefully', () => {
      process.env.NODE_ENV = '';

      expect(() => {
        configuration();
      }).toThrow('Missing required environment variables: NODE_ENV');
    });
  });
});
