import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import securitiesReducer from './slices/securitiesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    securities: securitiesReducer,
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
