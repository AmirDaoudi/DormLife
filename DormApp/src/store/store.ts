import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import requestsSlice from './requestsSlice';
import temperatureSlice from './temperatureSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    requests: requestsSlice,
    temperature: temperatureSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;