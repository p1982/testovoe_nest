// Global test setup file
import 'reflect-metadata';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test environment setup
beforeAll(() => {
  // Setup any global test environment
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Cleanup global test environment
  process.env.NODE_ENV = 'development';
}); 