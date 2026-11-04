import { configureStore } from '@reduxjs/toolkit';
import { partsApi } from '../api/partsApi.js';

export const store = configureStore({
  reducer: { [partsApi.reducerPath]: partsApi.reducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: { extraArgument: { apiKey: import.meta.env.VITE_FAVORIT_API_KEY } },
    }).concat(partsApi.middleware),
});
