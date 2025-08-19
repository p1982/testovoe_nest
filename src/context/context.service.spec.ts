import { Test, TestingModule } from '@nestjs/testing';
import { ContextService } from './context.service';
import { RequestContext } from './context.interface';

describe('ContextService', () => {
  let service: ContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContextService],
    }).compile();

    service = module.get<ContextService>(ContextService);
  });

  afterEach(() => {
    // Clean up any context that might have been set
    service.setContext({ executionId: 'cleanup' });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setContext', () => {
    it('should set context for current execution', () => {
      const context: RequestContext = { executionId: 'test-id-1' };
      service.setContext(context);

      const retrievedContext = service.getContext();
      expect(retrievedContext).toEqual(context);
    });

    it('should overwrite existing context', () => {
      const context1: RequestContext = { executionId: 'test-id-1' };
      const context2: RequestContext = { executionId: 'test-id-2' };

      service.setContext(context1);
      service.setContext(context2);

      const retrievedContext = service.getContext();
      expect(retrievedContext).toEqual(context2);
    });
  });

  describe('getContext', () => {
    it('should return undefined when no context is set', () => {
      const context = service.getContext();
      expect(context).toBeUndefined();
    });

    it('should return the set context', () => {
      const testContext: RequestContext = { executionId: 'test-id-3' };
      service.setContext(testContext);

      const retrievedContext = service.getContext();
      expect(retrievedContext).toEqual(testContext);
    });
  });

  describe('getExecutionId', () => {
    it('should return undefined when no context is set', () => {
      const executionId = service.getExecutionId();
      expect(executionId).toBeUndefined();
    });

    it('should return execution ID from context', () => {
      const testContext: RequestContext = { executionId: 'test-id-4' };
      service.setContext(testContext);

      const executionId = service.getExecutionId();
      expect(executionId).toBe('test-id-4');
    });
  });

  describe('runWithContext', () => {
    it('should execute function within context', () => {
      const context: RequestContext = { executionId: 'test-id-5' };
      let capturedExecutionId: string | undefined;

      const result = service.runWithContext(context, () => {
        capturedExecutionId = service.getExecutionId();
        return 'test-result';
      });

      expect(result).toBe('test-result');
      expect(capturedExecutionId).toBe('test-id-5');
    });

    it('should not affect context outside of execution', () => {
      const initialContext: RequestContext = { executionId: 'initial-id' };
      service.setContext(initialContext);

      const tempContext: RequestContext = { executionId: 'temp-id' };
      service.runWithContext(tempContext, () => {
        expect(service.getExecutionId()).toBe('temp-id');
      });

      // Context should be restored to initial
      expect(service.getExecutionId()).toBe('initial-id');
    });

    it('should handle async functions', async () => {
      const context: RequestContext = { executionId: 'async-test-id' };
      let capturedExecutionId: string | undefined;

      const result = await service.runWithContext(context, async () => {
        capturedExecutionId = service.getExecutionId();
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'async-result';
      });

      expect(result).toBe('async-result');
      expect(capturedExecutionId).toBe('async-test-id');
    });

    it('should handle errors within context', () => {
      const context: RequestContext = { executionId: 'error-test-id' };

      expect(() => {
        service.runWithContext(context, () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');
    });
  });

  describe('context isolation', () => {
    it('should maintain separate contexts for different executions', () => {
      const context1: RequestContext = { executionId: 'isolated-id-1' };
      const context2: RequestContext = { executionId: 'isolated-id-2' };

      let execution1Id: string | undefined;
      let execution2Id: string | undefined;

      service.runWithContext(context1, () => {
        execution1Id = service.getExecutionId();
      });

      service.runWithContext(context2, () => {
        execution2Id = service.getExecutionId();
      });

      expect(execution1Id).toBe('isolated-id-1');
      expect(execution2Id).toBe('isolated-id-2');
    });
  });
});
