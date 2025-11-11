import { BaseService } from './BaseService';
import { ApiClient } from './apiClient';

// Create a concrete implementation for testing
class TestService extends BaseService {
  constructor(baseEndpoint: string, client?: ApiClient) {
    super(baseEndpoint, client);
  }

  // Expose protected method for testing
  public testBuildEndpoint(path?: string): string {
    return this.buildEndpoint(path);
  }

  // Expose client for testing
  public getClient(): ApiClient {
    return this.client;
  }
}

describe('BaseService', () => {
  let service: TestService;
  let mockClient: jest.Mocked<ApiClient>;

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      postForm: jest.fn(),
    } as unknown as jest.Mocked<ApiClient>;
  });

  describe('constructor', () => {
    it('should initialize with base endpoint and default client', () => {
      service = new TestService('accounts');
      expect(service).toBeInstanceOf(BaseService);
      expect(service.getClient()).toBeDefined();
    });

    it('should initialize with custom client', () => {
      service = new TestService('accounts', mockClient);
      expect(service.getClient()).toBe(mockClient);
    });

    it('should handle different base endpoints', () => {
      const service1 = new TestService('users');
      const service2 = new TestService('securities');
      const service3 = new TestService('transactions');

      expect(service1).toBeInstanceOf(BaseService);
      expect(service2).toBeInstanceOf(BaseService);
      expect(service3).toBeInstanceOf(BaseService);
    });
  });

  describe('buildEndpoint', () => {
    beforeEach(() => {
      service = new TestService('accounts', mockClient);
    });

    it('should return base endpoint when no path provided', () => {
      expect(service.testBuildEndpoint()).toBe('accounts');
      expect(service.testBuildEndpoint('')).toBe('accounts');
    });

    it('should append path to base endpoint', () => {
      expect(service.testBuildEndpoint('123')).toBe('accounts/123');
      expect(service.testBuildEndpoint('list')).toBe('accounts/list');
    });

    it('should handle leading slash in path', () => {
      expect(service.testBuildEndpoint('/123')).toBe('accounts/123');
      expect(service.testBuildEndpoint('/list')).toBe('accounts/list');
    });

    it('should handle nested paths', () => {
      expect(service.testBuildEndpoint('123/values')).toBe('accounts/123/values');
      expect(service.testBuildEndpoint('123/values/456')).toBe('accounts/123/values/456');
    });

    it('should handle nested paths with leading slash', () => {
      expect(service.testBuildEndpoint('/123/values')).toBe('accounts/123/values');
      expect(service.testBuildEndpoint('/123/values/456')).toBe('accounts/123/values/456');
    });

    it('should not add extra slashes', () => {
      expect(service.testBuildEndpoint('path')).not.toContain('//');
      expect(service.testBuildEndpoint('/path')).not.toContain('//');
      expect(service.testBuildEndpoint('path/to/resource')).not.toContain('//');
    });
  });

  describe('endpoint building with different base endpoints', () => {
    it('should work with single-word base endpoint', () => {
      service = new TestService('users', mockClient);
      expect(service.testBuildEndpoint('123')).toBe('users/123');
    });

    it('should work with hyphenated base endpoint', () => {
      service = new TestService('financial-institutions', mockClient);
      expect(service.testBuildEndpoint('123')).toBe('financial-institutions/123');
    });

    it('should work with underscored base endpoint', () => {
      service = new TestService('account_values', mockClient);
      expect(service.testBuildEndpoint('list')).toBe('account_values/list');
    });

    it('should work with nested base endpoint', () => {
      service = new TestService('api/v1/accounts', mockClient);
      expect(service.testBuildEndpoint('123')).toBe('api/v1/accounts/123');
    });
  });

  describe('client usage', () => {
    beforeEach(() => {
      service = new TestService('accounts', mockClient);
    });

    it('should provide access to client methods', () => {
      expect(service.getClient().get).toBeDefined();
      expect(service.getClient().post).toBeDefined();
      expect(service.getClient().put).toBeDefined();
      expect(service.getClient().delete).toBeDefined();
      expect(service.getClient().postForm).toBeDefined();
    });

    it('should use the same client instance', () => {
      const client1 = service.getClient();
      const client2 = service.getClient();
      expect(client1).toBe(client2);
    });
  });

  describe('inheritance and extension', () => {
    class ExtendedService extends BaseService {
      constructor() {
        super('extended');
      }

      async getAll() {
        return this.client.get(this.buildEndpoint());
      }

      async getById(id: string) {
        return this.client.get(this.buildEndpoint(id));
      }

      async create(data: unknown) {
        return this.client.post(this.buildEndpoint(), data);
      }

      async update(id: string, data: unknown) {
        return this.client.put(this.buildEndpoint(id), data);
      }

      async delete(id: string) {
        return this.client.delete(this.buildEndpoint(id));
      }
    }

    it('should allow extending with custom methods', () => {
      const extendedService = new ExtendedService();
      expect(extendedService).toBeInstanceOf(BaseService);
      expect(typeof extendedService.getAll).toBe('function');
      expect(typeof extendedService.getById).toBe('function');
      expect(typeof extendedService.create).toBe('function');
      expect(typeof extendedService.update).toBe('function');
      expect(typeof extendedService.delete).toBe('function');
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      service = new TestService('test', mockClient);
    });

    it('should handle undefined path', () => {
      expect(service.testBuildEndpoint(undefined)).toBe('test');
    });

    it('should handle empty string', () => {
      expect(service.testBuildEndpoint('')).toBe('test');
    });

    it('should handle multiple leading slashes', () => {
      expect(service.testBuildEndpoint('//path')).toBe('test//path');
      // Only removes first slash
    });

    it('should handle path with only slash', () => {
      expect(service.testBuildEndpoint('/')).toBe('test/');
    });

    it('should handle whitespace in path', () => {
      expect(service.testBuildEndpoint('path with spaces')).toBe('test/path with spaces');
    });

    it('should handle special characters in path', () => {
      expect(service.testBuildEndpoint('path?query=1')).toBe('test/path?query=1');
      expect(service.testBuildEndpoint('path#anchor')).toBe('test/path#anchor');
    });
  });
});
