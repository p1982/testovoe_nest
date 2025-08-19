import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { ContextService } from './context/context.service';
import { CronService } from './cron/cron.service';
import { ConfigService } from '@nestjs/config';

describe('App Integration', () => {
  let app: INestApplication;
  let contextService: ContextService;
  let cronService: CronService;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    contextService = moduleFixture.get<ContextService>(ContextService);
    cronService = moduleFixture.get<CronService>(CronService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Application Module Integration', () => {
    it('should have all required services available', () => {
      expect(contextService).toBeDefined();
      expect(cronService).toBeDefined();
      expect(configService).toBeDefined();
    });

    it('should have ContextService with AsyncLocalStorage', () => {
      expect(contextService).toHaveProperty('getContext');
      expect(contextService).toHaveProperty('setContext');
      expect(contextService).toHaveProperty('getExecutionId');
      expect(contextService).toHaveProperty('runWithContext');
    });

    it('should have CronService with scheduling capabilities', () => {
      expect(cronService).toHaveProperty('handleCronJob');
    });

    it('should have ConfigService with configuration values', () => {
      expect(configService.get('app.port')).toBeDefined();
      expect(configService.get('app.environment')).toBeDefined();
      expect(configService.get('cron.enabled')).toBeDefined();
      expect(configService.get('cron.interval')).toBeDefined();
    });
  });

  describe('Context Service Integration', () => {
    it('should create and retrieve context correctly', () => {
      const testContext = { executionId: 'test-integration-id' };
      
      contextService.setContext(testContext);
      const retrievedContext = contextService.getContext();
      
      expect(retrievedContext).toEqual(testContext);
    });

    it('should execute functions within context', () => {
      const testContext = { executionId: 'test-execution-id' };
      let capturedExecutionId: string | undefined;
      
      const result = contextService.runWithContext(testContext, () => {
        capturedExecutionId = contextService.getExecutionId();
        return 'integration-test-result';
      });
      
      expect(result).toBe('integration-test-result');
      expect(capturedExecutionId).toBe('test-execution-id');
    });

    it('should maintain context isolation between executions', () => {
      const context1 = { executionId: 'context-1' };
      const context2 = { executionId: 'context-2' };
      
      let execution1Id: string | undefined;
      let execution2Id: string | undefined;
      
      contextService.runWithContext(context1, () => {
        execution1Id = contextService.getExecutionId();
      });
      
      contextService.runWithContext(context2, () => {
        execution2Id = contextService.getExecutionId();
      });
      
      expect(execution1Id).toBe('context-1');
      expect(execution2Id).toBe('context-2');
    });
  });

  describe('Configuration Integration', () => {
    it('should provide default configuration values', () => {
      const port = configService.get<number>('app.port');
      const environment = configService.get<string>('app.environment');
      const cronEnabled = configService.get<boolean>('cron.enabled');
      const cronInterval = configService.get<number>('cron.interval');
      
      expect(port).toBeDefined();
      expect(environment).toBeDefined();
      expect(cronEnabled).toBeDefined();
      expect(cronInterval).toBeDefined();
    });

    it('should have consistent configuration structure', () => {
      const config = {
        app: {
          port: configService.get<number>('app.port'),
          environment: configService.get<string>('app.environment'),
          name: configService.get<string>('app.name'),
        },
        logging: {
          level: configService.get<string>('logging.level'),
        },
        cron: {
          enabled: configService.get<boolean>('cron.enabled'),
          interval: configService.get<number>('cron.interval'),
        },
        context: {
          timeout: configService.get<number>('context.timeout'),
        },
      };
      
      expect(config.app).toHaveProperty('port');
      expect(config.app).toHaveProperty('environment');
      expect(config.app).toHaveProperty('name');
      expect(config.logging).toHaveProperty('level');
      expect(config.cron).toHaveProperty('enabled');
      expect(config.cron).toHaveProperty('interval');
      expect(config.context).toHaveProperty('timeout');
    });
  });

  describe('Cron Service Integration', () => {
    it('should respect cron.enabled configuration', () => {
      const cronEnabled = configService.get<boolean>('cron.enabled');
      
      if (cronEnabled) {
        expect(cronService.handleCronJob).toBeDefined();
      }
    });

    it('should have access to configuration service', () => {
      const cronEnabled = configService.get<boolean>('cron.enabled');
      const cronInterval = configService.get<number>('cron.interval');
      
      expect(cronEnabled).toBeDefined();
      expect(cronInterval).toBeDefined();
    });
  });

  describe('Environment Configuration', () => {
    it('should load environment variables correctly', () => {
      const nodeEnv = process.env.NODE_ENV;
      const port = process.env.PORT;
      
      if (nodeEnv) {
        expect(configService.get('app.environment')).toBe(nodeEnv);
      }
      
      if (port) {
        expect(configService.get('app.port')).toBe(parseInt(port, 10));
      }
    });

    it('should provide fallback values for missing environment variables', () => {
      const originalPort = process.env.PORT;
      delete process.env.PORT;
      
      const port = configService.get<number>('app.port');
      expect(port).toBe(3000); // Default value
      
      // Restore original value
      if (originalPort) {
        process.env.PORT = originalPort;
      }
    });
  });
}); 