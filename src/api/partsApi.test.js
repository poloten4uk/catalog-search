import { test } from 'node:test';
import assert from 'node:assert/strict';
import { configureStore } from '@reduxjs/toolkit';
import { MISSING_KEY_MESSAGE } from './parts.js';
import { partsApi } from './partsApi.js';

function storeForTest(t, handler, apiKey = 'test-key') {
  t.mock.method(globalThis, 'fetch', handler);
  const store = configureStore({
    reducer: { [partsApi.reducerPath]: partsApi.reducer },
    middleware: (getDefault) =>
      getDefault({ thunk: { extraArgument: { apiKey } } }).concat(partsApi.middleware),
  });
  t.after(() => store.dispatch(partsApi.util.resetApiState()));
  return store;
}

test('treats an HTTP 200 with error as a failed Redux query', async (t) => {
  const store = storeForTest(t, async () => Response.json({ error: 'Invalid key client!' }));
  const result = await store.dispatch(partsApi.endpoints.getManufacturers.initiate('01089'));
  assert.equal(result.isError, true);
  assert.equal(result.error.status, 'CUSTOM_ERROR');
  assert.match(result.error.error, /ключ/);
});

test('converts a network failure into a retryable query error', async (t) => {
  const store = storeForTest(t, async () => {
    throw new TypeError('Failed to fetch');
  });
  const result = await store.dispatch(partsApi.endpoints.getManufacturers.initiate('01089'));
  assert.equal(result.isError, true);
  assert.equal(result.error.status, 'FETCH_ERROR');
});

test('keeps out-of-order search responses under their own query arguments', async (t) => {
  const pending = new Map();
  const store = storeForTest(
    t,
    (request) =>
      new Promise((resolve) => {
        pending.set(new URL(request.url).searchParams.get('number'), resolve);
      }),
  );
  const first = store.dispatch(partsApi.endpoints.getManufacturers.initiate('old'));
  const second = store.dispatch(partsApi.endpoints.getManufacturers.initiate('new'));
  await new Promise((resolve) => setImmediate(resolve));
  pending.get('new')(Response.json({ goods: [{ brand: 'NEW', number: 'new' }] }));
  await second;
  pending.get('old')(Response.json({ goods: [{ brand: 'OLD', number: 'old' }] }));
  await first;
  const current = partsApi.endpoints.getManufacturers.select('new')(store.getState());
  assert.equal(current.data[0].name, 'NEW');
});

test('sends the configured key with every request', async (t) => {
  let url;
  const store = storeForTest(t, async (request) => {
    url = new URL(request.url);
    return Response.json({ goods: [] });
  });
  await store.dispatch(partsApi.endpoints.getManufacturers.initiate('01089'));
  assert.equal(url.searchParams.get('key'), 'test-key');
  assert.equal(url.searchParams.get('number'), '01089');
});

test('fails without calling the API when the key is not configured', async (t) => {
  const fetch = t.mock.fn(async () => Response.json({ goods: [] }));
  const store = storeForTest(t, fetch, '  ');
  const result = await store.dispatch(partsApi.endpoints.getManufacturers.initiate('01089'));
  assert.equal(result.isError, true);
  assert.equal(result.error.error, MISSING_KEY_MESSAGE);
  assert.equal(fetch.mock.callCount(), 0);
});
