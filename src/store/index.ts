import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import securitiesReducer from './slices/securitiesSlice';
import financialInstitutionsReducer from './slices/financialInstitutionsSlice';
import accountsReducer from './slices/accountsSlice';
import holdingsReducer from './slices/holdingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    securities: securitiesReducer,
    financialInstitutions: financialInstitutionsReducer,
    accounts: accountsReducer,
    holdings: holdingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types if needed
        ignoredActions: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
