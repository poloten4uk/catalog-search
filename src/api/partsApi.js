import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  API_URL,
  MISSING_KEY_MESSAGE,
  getManufacturers,
  getOffers,
  parsePartsResponse,
  requestParams,
} from './parts.js';

const fetchQuery = fetchBaseQuery({
  baseUrl: API_URL,
  timeout: 12_000,
  credentials: 'omit',
  redirect: 'error',
});

// The key comes from the store's thunk extra argument (see app/store.js).
export async function partsBaseQuery(args, api, extraOptions) {
  const key = typeof api.extra?.apiKey === 'string' ? api.extra.apiKey.trim() : '';
  if (!key) return { error: { status: 'CUSTOM_ERROR', error: MISSING_KEY_MESSAGE } };
  const result = await fetchQuery({ url: `?${requestParams(args, key)}` }, api, extraOptions);
  if (result.error) return result;
  try {
    return { ...result, data: parsePartsResponse(result.data) };
  } catch (error) {
    return { error: { status: 'CUSTOM_ERROR', error: error.message } };
  }
}

export const partsApi = createApi({
  reducerPath: 'partsApi',
  baseQuery: partsBaseQuery,
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getManufacturers: builder.query({
      query: (number) => ({ number }),
      transformResponse: getManufacturers,
    }),
    getOffers: builder.query({
      query: (args) => args,
      transformResponse: getOffers,
    }),
  }),
});

export const { useGetManufacturersQuery, useGetOffersQuery } = partsApi;
