import { Test, TestingModule } from '@nestjs/testing';
import { ContextMiddleware } from './context.middleware';
import { ContextService } from './context.service';
import { Request, Response, NextFunction } from 'express';

describe('ContextMiddleware', () => {
  let middleware: ContextMiddleware;
  let contextService: ContextService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContextMiddleware, ContextService],
    }).compile();

    middleware = module.get<ContextMiddleware>(ContextMiddleware);
    contextService = module.get<ContextService>(ContextService);
    
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
  });

  afterEach(() => {
    // Clean up context
    contextService.setContext({ executionId: 'cleanup' });
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should create execution context and call next', () => {
      // Spy on context service methods
      const runWithContextSpy = jest.spyOn(contextService, 'runWithContext');
      
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(runWithContextSpy).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should generate unique execution ID for each request', () => {
      const executionIds: string[] = [];
      
      // Mock the runWithContext to capture execution IDs
      jest.spyOn(contextService, 'runWithContext').mockImplementation((context, fn) => {
        executionIds.push(context.executionId);
        return fn();
      });
      
      // Make multiple requests
      for (let i = 0; i < 3; i++) {
        middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      }
      
      // All execution IDs should be unique
      expect(executionIds).toHaveLength(3);
      expect(new Set(executionIds).size).toBe(3);
      
      // Execution IDs should be valid UUIDs (basic format check)
      executionIds.forEach(id => {
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      });
    });

    it('should execute next middleware within context', () => {
      let contextDuringExecution: string | undefined;
      
      jest.spyOn(contextService, 'runWithContext').mockImplementation((context, fn) => {
        contextDuringExecution = context.executionId;
        return fn();
      });
      
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(contextDuringExecution).toBeDefined();
      expect(contextDuringExecution).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should handle errors in next middleware gracefully', () => {
      const error = new Error('Middleware error');
      const errorNext = jest.fn().mockImplementation(() => {
        throw error;
      });
      
      expect(() => {
        middleware.use(mockRequest as Request, mockResponse as Response, errorNext);
      }).toThrow('Middleware error');
    });

    it('should maintain context isolation between requests', () => {
      const capturedContexts: string[] = [];
      
      jest.spyOn(contextService, 'runWithContext').mockImplementation((context, fn) => {
        capturedContexts.push(context.executionId);
        return fn();
      });
      
      // Simulate multiple concurrent requests
      const promises = Array.from({ length: 5 }, () => 
        new Promise<void>((resolve) => {
          middleware.use(mockRequest as Request, mockResponse as Response, () => {
            resolve();
          });
        })
      );
      
      Promise.all(promises).then(() => {
        // All contexts should be unique
        expect(new Set(capturedContexts).size).toBe(5);
      });
    });
  });

  describe('integration with ContextService', () => {
    it('should use ContextService.runWithContext method', () => {
      const runWithContextSpy = jest.spyOn(contextService, 'runWithContext');
      
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(runWithContextSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          executionId: expect.any(String)
        }),
        expect.any(Function)
      );
    });

    it('should pass correct context structure', () => {
      let capturedContext: any;
      
      jest.spyOn(contextService, 'runWithContext').mockImplementation((context, fn) => {
        capturedContext = context;
        return fn();
      });
      
      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(capturedContext).toHaveProperty('executionId');
      expect(typeof capturedContext.executionId).toBe('string');
      expect(capturedContext.executionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });
}); 