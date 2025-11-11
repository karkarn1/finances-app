// Mock apiClient for Jest tests
export class ApiClientError extends Error {
  status: number;
  detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.detail = detail;
  }
}

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8000/api/v1') {
    this.baseURL = baseURL;
  }

  async get<T>(endpoint: string): Promise<T> {
    return {} as T;
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return {} as T;
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return {} as T;
  }

  async delete<T>(endpoint: string): Promise<T> {
    return {} as T;
  }

  async postForm<T>(endpoint: string, data: URLSearchParams): Promise<T> {
    return {} as T;
  }
}

export const apiClient = new ApiClient();
