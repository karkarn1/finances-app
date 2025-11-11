// Mock fetch before imports
global.fetch = jest.fn();

import { ApiClient, ApiClientError } from './apiClient';

describe('ApiClient', () => {
  let client: ApiClient;
  const mockBaseURL = 'http://localhost:8000/api/v1';

  beforeEach(() => {
    client = new ApiClient(mockBaseURL);
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with provided base URL', () => {
      const customClient = new ApiClient('https://api.example.com');
      expect(customClient).toBeInstanceOf(ApiClient);
    });

    it('should use default base URL if not provided', () => {
      const defaultClient = new ApiClient();
      expect(defaultClient).toBeInstanceOf(ApiClient);
    });
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await client.get<typeof mockData>('/users');

      expect(fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/users`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should include auth token in headers if available', async () => {
      localStorage.setItem('auth_token', 'test-token-123');
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/protected');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
    });

    it('should handle GET request without auth token', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/public');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.anything(),
          }),
        })
      );
    });

    it('should handle leading slash in endpoint', async () => {
      // Mock both calls
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        });

      await client.get('/users');
      await client.get('users');

      expect(fetch).toHaveBeenNthCalledWith(1, `${mockBaseURL}/users`, expect.any(Object));
      expect(fetch).toHaveBeenNthCalledWith(2, `${mockBaseURL}/users`, expect.any(Object));
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request with data', async () => {
      const requestData = { name: 'New User', email: 'user@example.com' };
      const responseData = { id: 1, ...requestData };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => responseData,
      });

      const result = await client.post('/users', requestData);

      expect(fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/users`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(requestData),
        })
      );
      expect(result).toEqual(responseData);
    });

    it('should handle POST request without data', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await client.post('/action');

      expect(fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/action`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      // Verify body is not included when data is undefined
      const callArgs = (fetch as jest.Mock).mock.calls[0][1];
      expect(callArgs.body).toBeUndefined();
    });
  });

  describe('PUT requests', () => {
    it('should make successful PUT request', async () => {
      const updateData = { name: 'Updated Name' };
      const responseData = { id: 1, ...updateData };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => responseData,
      });

      const result = await client.put('/users/1', updateData);

      expect(fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/users/1`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(responseData);
    });
  });

  describe('DELETE requests', () => {
    it('should make successful DELETE request', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await client.delete('/users/1');

      expect(fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/users/1`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toEqual({});
    });

    it('should handle DELETE with JSON response', async () => {
      const responseData = { message: 'Deleted successfully' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => responseData,
      });

      const result = await client.delete('/users/1');

      expect(result).toEqual(responseData);
    });
  });

  describe('POST form requests', () => {
    it('should make form-encoded POST request', async () => {
      const formData = new URLSearchParams();
      formData.append('username', 'testuser');
      formData.append('password', 'testpass');

      const responseData = { access_token: 'token123' };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => responseData,
      });

      const result = await client.postForm('/auth/login', formData);

      expect(fetch).toHaveBeenCalledWith(
        `${mockBaseURL}/auth/login`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
          body: formData,
        })
      );
      expect(result).toEqual(responseData);
    });
  });

  describe('Error handling', () => {
    it('should throw ApiClientError for 404', async () => {
      // Mock both test calls
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({ detail: 'Resource not found' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({ detail: 'Resource not found' }),
        });

      await expect(client.get('/nonexistent')).rejects.toThrow(ApiClientError);
      await expect(client.get('/nonexistent')).rejects.toThrow('API request failed: Not Found');
    });

    it('should include error detail in ApiClientError', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ detail: 'Invalid input data' }),
      });

      try {
        await client.get('/invalid');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        expect((error as ApiClientError).status).toBe(400);
        expect((error as ApiClientError).detail).toBe('Invalid input data');
      }
    });

    it('should handle error with message field', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error occurred' }),
      });

      try {
        await client.get('/error');
      } catch (error) {
        expect((error as ApiClientError).detail).toBe('Server error occurred');
      }
    });

    it('should handle error without JSON body', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('No JSON');
        },
      });

      try {
        await client.get('/error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        expect((error as ApiClientError).detail).toBe('Internal Server Error');
      }
    });

    it('should handle 401 Unauthorized', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ detail: 'Invalid credentials' }),
      });

      await expect(client.post('/login', {})).rejects.toThrow(ApiClientError);
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(client.get('/users')).rejects.toThrow('Network error');
    });
  });

  describe('Response handling', () => {
    it('should handle 204 No Content', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await client.delete('/resource');

      expect(result).toEqual({});
    });

    it('should handle empty JSON response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('No content');
        },
      });

      const result = await client.get('/empty');

      expect(result).toEqual({});
    });

    it('should parse JSON response correctly', async () => {
      const complexData = {
        users: [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }],
        metadata: { total: 2, page: 1 },
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => complexData,
      });

      const result = await client.get('/users');

      expect(result).toEqual(complexData);
    });
  });

  describe('Custom headers', () => {
    it('should allow custom headers in options', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/custom', {
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should merge custom headers with defaults', async () => {
      localStorage.setItem('auth_token', 'test-token');
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/custom', {
        headers: {
          'X-Custom-Header': 'value',
        },
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'value',
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });
});
