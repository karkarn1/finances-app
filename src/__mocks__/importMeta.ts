// Mock for import.meta in Jest tests
export const importMeta = {
  env: {
    VITE_API_BASE_URL: 'http://localhost:8000/api/v1',
    DEV: true,
  },
};
