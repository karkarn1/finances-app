import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import securitiesReducer from './slices/securitiesSlice';
import financialInstitutionsReducer from './slices/financialInstitutionsSlice';
import accountsReducer from './slices/accountsSlice';
import holdingsReducer from './slices/holdingsSlice';
import currenciesReducer from './slices/currenciesSlice';
import { baseApi } from './api/baseApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    securities: securitiesReducer,
    financialInstitutions: financialInstitutionsReducer,
    accounts: accountsReducer,
    holdings: holdingsReducer,
    currencies: currenciesReducer,
    // Add RTK Query API reducer
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types if needed
        ignoredActions: [],
      },
    })
      // Add RTK Query middleware for caching, invalidation, polling, etc.
      .concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
