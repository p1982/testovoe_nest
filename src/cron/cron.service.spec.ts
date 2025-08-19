import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CronService } from './cron.service';
import { ContextService } from '../context/context.service';
import { RequestContext } from '../context/context.interface';

// Mock the uuid module
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-12345'),
}));

describe('CronService', () => {
  let service: CronService;
  let contextService: ContextService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        {
          provide: ContextService,
          useValue: {
            runWithContext: jest.fn(),
            getExecutionId: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CronService>(CronService);
    contextService = module.get<ContextService>(ContextService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleCronJob', () => {
    it('should execute cron job when enabled', () => {
      // Mock configuration
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'cron.enabled') return true;
        if (key === 'cron.interval') return 30;
        return undefined;
      });

      // Mock context service
      jest
        .spyOn(contextService, 'runWithContext')
        .mockImplementation((context, fn) => {
          expect(context.executionId).toBe('test-uuid-12345');
          return fn();
        });

      jest
        .spyOn(contextService, 'getExecutionId')
        .mockReturnValue('test-uuid-12345');

      service.handleCronJob();

      expect(contextService.runWithContext).toHaveBeenCalledWith(
        { executionId: 'test-uuid-12345' },
        expect.any(Function),
      );
    });

    it('should skip execution when cron is disabled', () => {
      // Mock configuration - cron disabled
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'cron.enabled') return false;
        return undefined;
      });

      service.handleCronJob();

      expect(contextService.runWithContext).not.toHaveBeenCalled();
    });

    it('should handle undefined cron.enabled configuration', () => {
      // Mock configuration - cron.enabled is undefined
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'cron.enabled') return undefined;
        if (key === 'cron.interval') return 30;
        return undefined;
      });

      service.handleCronJob();

      expect(contextService.runWithContext).not.toHaveBeenCalled();
    });

    it('should use correct interval from configuration', () => {
      // Mock configuration with custom interval
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'cron.enabled') return true;
        if (key === 'cron.interval') return 15;
        return undefined;
      });

      jest
        .spyOn(contextService, 'runWithContext')
        .mockImplementation((context, fn) => fn());
      jest
        .spyOn(contextService, 'getExecutionId')
        .mockReturnValue('test-uuid-12345');

      service.handleCronJob();

      expect(contextService.runWithContext).toHaveBeenCalled();
    });

    it('should handle missing interval configuration', () => {
      // Mock configuration - interval is undefined
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'cron.enabled') return true;
        if (key === 'cron.interval') return undefined;
        return undefined;
      });

      jest
        .spyOn(contextService, 'runWithContext')
        .mockImplementation((context, fn) => fn());
      jest
        .spyOn(contextService, 'getExecutionId')
        .mockReturnValue('test-uuid-12345');

      service.handleCronJob();

      expect(contextService.runWithContext).toHaveBeenCalled();
    });

    it('should execute function within context', () => {
      // Mock configuration
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'cron.enabled') return true;
        if (key === 'cron.interval') return 30;
        return undefined;
      });

      let contextDuringExecution: RequestContext | undefined;
      jest
        .spyOn(contextService, 'runWithContext')
        .mockImplementation((context, fn) => {
          contextDuringExecution = context;
          return fn();
        });

      jest
        .spyOn(contextService, 'getExecutionId')
        .mockReturnValue('test-uuid-12345');

      service.handleCronJob();

      expect(contextDuringExecution).toEqual({
        executionId: 'test-uuid-12345',
      });
    });

    it('should handle errors in context execution gracefully', () => {
      // Mock configuration
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'cron.enabled') return true;
        if (key === 'cron.interval') return 30;
        return undefined;
      });

      const error = new Error('Context execution error');
      jest.spyOn(contextService, 'runWithContext').mockImplementation(() => {
        throw error;
      });

      expect(() => {
        service.handleCronJob();
      }).toThrow('Context execution error');
    });
  });

  describe('configuration integration', () => {
    it('should handle multiple configuration calls correctly', () => {
      const getSpy = jest
        .spyOn(configService, 'get')
        .mockImplementation((key: string) => {
          if (key === 'cron.enabled') return true;
          if (key === 'cron.interval') return 45;
          return undefined;
        });

      jest
        .spyOn(contextService, 'runWithContext')
        .mockImplementation((context, fn) => fn());
      jest
        .spyOn(contextService, 'getExecutionId')
        .mockReturnValue('test-uuid-12345');

      service.handleCronJob();

      expect(getSpy).toHaveBeenCalledTimes(2);
      expect(getSpy).toHaveBeenNthCalledWith(1, 'cron.enabled');
      expect(getSpy).toHaveBeenNthCalledWith(2, 'cron.interval');
    });
  });
});
