import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ContextService } from './context/context.service';

describe('AppController', () => {
  let controller: AppController;
  let contextService: ContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: ContextService,
          useValue: {
            getExecutionId: jest.fn(),
            getContext: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    contextService = module.get<ContextService>(ContextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getExecutionId', () => {
    it('should return execution ID when context is available', () => {
      const mockExecutionId = 'test-execution-id-123';
      jest
        .spyOn(contextService, 'getExecutionId')
        .mockReturnValue(mockExecutionId);

      const result = controller.getExecutionId();

      expect(result).toEqual({ executionId: mockExecutionId });
      expect(contextService.getExecutionId).toHaveBeenCalledTimes(1);
    });

    it('should return different execution ID for different calls', () => {
      const mockExecutionId1 = 'test-execution-id-1';
      const mockExecutionId2 = 'test-execution-id-2';

      jest
        .spyOn(contextService, 'getExecutionId')
        .mockReturnValueOnce(mockExecutionId1)
        .mockReturnValueOnce(mockExecutionId2);

      const result1 = controller.getExecutionId();
      const result2 = controller.getExecutionId();

      expect(result1).toEqual({ executionId: mockExecutionId1 });
      expect(result2).toEqual({ executionId: mockExecutionId2 });
      expect(contextService.getExecutionId).toHaveBeenCalledTimes(2);
    });

    it('should throw error when execution ID is undefined', () => {
      jest.spyOn(contextService, 'getExecutionId').mockReturnValue(undefined);

      expect(() => {
        controller.getExecutionId();
      }).toThrow('Execution ID not found in context');

      expect(contextService.getExecutionId).toHaveBeenCalledTimes(1);
    });

    it('should throw error when execution ID is null', () => {
      jest.spyOn(contextService, 'getExecutionId').mockReturnValue(null as any);

      expect(() => {
        controller.getExecutionId();
      }).toThrow('Execution ID not found in context');

      expect(contextService.getExecutionId).toHaveBeenCalledTimes(1);
    });

    it('should return execution ID with correct structure', () => {
      const mockExecutionId = 'valid-uuid-12345-67890';
      jest
        .spyOn(contextService, 'getExecutionId')
        .mockReturnValue(mockExecutionId);

      const result = controller.getExecutionId();

      expect(result).toHaveProperty('executionId');
      expect(typeof result.executionId).toBe('string');
      expect(result.executionId).toBe(mockExecutionId);
    });

    it('should handle UUID v4 format execution IDs', () => {
      const mockExecutionId = '550e8400-e29b-41d4-a716-446655440000';
      jest
        .spyOn(contextService, 'getExecutionId')
        .mockReturnValue(mockExecutionId);

      const result = controller.getExecutionId();

      expect(result.executionId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe('error handling', () => {
    it('should throw HttpException with correct message and status', () => {
      jest.spyOn(contextService, 'getExecutionId').mockReturnValue(undefined);

      expect(() => {
        controller.getExecutionId();
      }).toThrow('Execution ID not found in context');
    });

    it('should handle multiple error scenarios consistently', () => {
      const errorScenarios = [undefined, null];

      errorScenarios.forEach(scenario => {
        jest
          .spyOn(contextService, 'getExecutionId')
          .mockReturnValue(scenario as any);

        expect(() => {
          controller.getExecutionId();
        }).toThrow('Execution ID not found in context');
      });
    });
  });

  describe('integration with ContextService', () => {
    it('should call ContextService.getExecutionId exactly once per request', () => {
      const mockExecutionId = 'test-execution-id-integration';
      const getExecutionIdSpy = jest
        .spyOn(contextService, 'getExecutionId')
        .mockReturnValue(mockExecutionId);

      controller.getExecutionId();

      expect(getExecutionIdSpy).toHaveBeenCalledTimes(1);
      expect(getExecutionIdSpy).toHaveBeenCalledWith();
    });

    it('should not call ContextService methods multiple times', () => {
      const mockExecutionId = 'test-execution-id-no-multiple-calls';
      const getExecutionIdSpy = jest
        .spyOn(contextService, 'getExecutionId')
        .mockReturnValue(mockExecutionId);

      controller.getExecutionId();

      expect(getExecutionIdSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('response format', () => {
    it('should return object with executionId property', () => {
      const mockExecutionId = 'test-execution-id-format';
      jest
        .spyOn(contextService, 'getExecutionId')
        .mockReturnValue(mockExecutionId);

      const result = controller.getExecutionId();

      expect(result).toHaveProperty('executionId');
      expect(Object.keys(result)).toHaveLength(1);
    });

    it('should maintain response structure consistency', () => {
      const testIds = ['id-1', 'id-2', 'id-3'];

      testIds.forEach(testId => {
        jest.spyOn(contextService, 'getExecutionId').mockReturnValue(testId);

        const result = controller.getExecutionId();

        expect(result).toHaveProperty('executionId');
        expect(result.executionId).toBe(testId);
        expect(Object.keys(result)).toHaveLength(1);
      });
    });
  });

  describe('getHealth', () => {
    beforeEach(() => {
      // Mock process.memoryUsage and process.cpuUsage
      jest.spyOn(process, 'memoryUsage').mockReturnValue({
        heapUsed: 1024 * 1024 * 50, // 50MB
        heapTotal: 1024 * 1024 * 100, // 100MB
        external: 1024 * 1024 * 10, // 10MB
        rss: 1024 * 1024 * 80, // 80MB
      } as any);

      jest.spyOn(process, 'cpuUsage').mockReturnValue({
        user: 100000, // 100ms
        system: 50000, // 50ms
      } as any);

      // Mock Date.now for consistent uptime testing
      const mockDateNow = jest.spyOn(Date, 'now');
      mockDateNow.mockReturnValue(1000000);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return comprehensive health information', () => {
      const result = controller.getHealth();

      expect(result).toHaveProperty('status', 'healthy');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('system');
      expect(result).toHaveProperty('context');
    });

    it('should return correct memory information', () => {
      const result = controller.getHealth();

      expect(result.memory).toHaveProperty('used', 50);
      expect(result.memory).toHaveProperty('total', 100);
      expect(result.memory).toHaveProperty('free', 50);
      expect(result.memory).toHaveProperty('external', 10);
    });

    it('should return correct system information', () => {
      const result = controller.getHealth();

      expect(result.system).toHaveProperty('platform', process.platform);
      expect(result.system).toHaveProperty('nodeVersion', process.version);
      expect(result.system).toHaveProperty('pid', process.pid);
      expect(result.system).toHaveProperty('cpuUsage', 150); // 100 + 50
    });

    it('should return correct context information', () => {
      const mockContext = { executionId: 'test-context-id' };
      jest.spyOn(contextService, 'getContext').mockReturnValue(mockContext);
      jest
        .spyOn(contextService, 'getExecutionId')
        .mockReturnValue('test-exec-id');

      const result = controller.getHealth();

      expect(result.context).toHaveProperty('active', true);
      expect(result.context).toHaveProperty('executionId', 'test-exec-id');
    });

    it('should handle missing context gracefully', () => {
      jest.spyOn(contextService, 'getContext').mockReturnValue(undefined);
      jest.spyOn(contextService, 'getExecutionId').mockReturnValue(undefined);

      const result = controller.getHealth();

      expect(result.context).toHaveProperty('active', false);
      expect(result.context.executionId).toBeUndefined();
    });

    it('should calculate uptime correctly', () => {
      // Mock startTime to be 100 seconds ago
      const startTime = 1000000 - 100 * 1000;
      (controller as any).startTime = startTime;

      const result = controller.getHealth();

      expect(result.uptime).toBe(100);
    });

    it('should use environment from process.env.NODE_ENV', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const result = controller.getHealth();

      expect(result.environment).toBe('production');

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should fallback to development when NODE_ENV is not set', () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      const result = controller.getHealth();

      expect(result.environment).toBe('development');

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle memory usage errors gracefully', () => {
      jest.spyOn(process, 'memoryUsage').mockImplementation(() => {
        throw new Error('Memory usage error');
      });

      expect(() => {
        controller.getHealth();
      }).toThrow('Health check failed');
    });

    it('should handle CPU usage errors gracefully', () => {
      jest.spyOn(process, 'cpuUsage').mockImplementation(() => {
        throw new Error('CPU usage error');
      });

      expect(() => {
        controller.getHealth();
      }).toThrow('Health check failed');
    });
  });
});
