// Mock for import.meta.env in tests
// This must run before any modules are loaded

// Create a getter that returns environment variables
const mockEnv = {
  VITE_API_BASE_URL: 'http://localhost:8000/api/v1',
  DEV: true,
};

// Override how TypeScript/Vite's import.meta.env is accessed during tests
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      get env() {
        return mockEnv;
      },
    },
  },
  writable: false,
  configurable: true,
});

// Also define on globalThis for better compatibility
if (typeof globalThis !== 'undefined') {
  Object.defineProperty(globalThis, 'import', {
    value: {
      meta: {
        get env() {
          return mockEnv;
        },
      },
    },
    writable: false,
    configurable: true,
  });
}

export {};
