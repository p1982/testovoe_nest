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
    it('should throw Error instance with correct message', () => {
      jest.spyOn(contextService, 'getExecutionId').mockReturnValue(undefined);

      try {
        controller.getExecutionId();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Execution ID not found in context');
      }
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
});
