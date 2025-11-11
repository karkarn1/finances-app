/**
 * Test utility for rendering components with Redux and Router providers
 */

import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore, PreloadedState, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

// Create minimal mock reducers for slices that use import.meta
// These can be overridden with actual implementations in tests that need them
const createMockSlice = (name: string) =>
  createSlice({
    name,
    initialState: {},
    reducers: {},
  });

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  route?: string;
  reducers?: Record<string, any>;
}

/**
 * Renders component with Redux store and React Router
 * @param ui Component to render
 * @param options Render options including preloadedState for Redux and route for Router
 * @returns Render result plus store instance
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    route = '/',
    reducers = {},
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  // Create store with preloaded state and provided or mock reducers
  const store = configureStore({
    reducer: {
      auth: reducers.auth || createMockSlice('auth').reducer,
      securities: reducers.securities || createMockSlice('securities').reducer,
      financialInstitutions:
        reducers.financialInstitutions ||
        createMockSlice('financialInstitutions').reducer,
      accounts: reducers.accounts || createMockSlice('accounts').reducer,
      holdings: reducers.holdings || createMockSlice('holdings').reducer,
      currencies: reducers.currencies || createMockSlice('currencies').reducer,
    },
    preloadedState,
  });

  // Set initial route
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Renders component with only React Router (no Redux)
 * Useful for testing components that don't need Redux
 */
export function renderWithRouter(
  ui: ReactElement,
  { route = '/', ...renderOptions }: ExtendedRenderOptions = {}
) {
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }: { children: ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
