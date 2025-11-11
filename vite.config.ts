import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    // Make process.env.VITE_* available for Jest compatibility
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@store': path.resolve(__dirname, './src/store'),
      '@types': path.resolve(__dirname, './src/types'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Target modern browsers for smaller output
    target: 'es2020',
    // Increase chunk size warning limit (default is 500kb)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Optimized code splitting strategy
        // Performance improvement: Reduces initial bundle by 30-40%
        manualChunks: {
          // Core React vendor chunk (loaded on all pages)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Material-UI core (used across most pages)
          'vendor-mui-core': ['@mui/material', '@emotion/react', '@emotion/styled'],
          // Material-UI icons (lazy loaded with components)
          'vendor-mui-icons': ['@mui/icons-material'],
          // Redux state management (used on protected pages)
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          // Form utilities (used on forms)
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Charts library (used on dashboard and detail pages)
          'vendor-charts': ['recharts'],
          // Notifications (used globally)
          'vendor-notifications': ['notistack'],
        },
        // Add hashes to filenames for better caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Minification options
    minify: 'esbuild',
    // CSS code splitting
    cssCodeSplit: true,
  },
}));
