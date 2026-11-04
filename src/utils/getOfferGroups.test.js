import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getOfferGroups } from './getOfferGroups.js';

const offers = Object.freeze([
  Object.freeze({ id: 'unpriced', isAnalogue: true, price: null, stock: null }),
  Object.freeze({ id: 'expensive', isAnalogue: true, price: 100, stock: 20 }),
  Object.freeze({ id: 'original', isAnalogue: false, price: 500, stock: 0 }),
  Object.freeze({ id: 'cheap', isAnalogue: true, price: 10, stock: 5 }),
  Object.freeze({ id: 'unavailable', isAnalogue: true, price: 50, stock: 0 }),
]);
const ids = (items) => items.map((item) => item.id);

test('separates the requested part and preserves the API order of analogues by default', () => {
  const { originalOffers, analogueOffers } = getOfferGroups(offers, { sort: 'default' });
  assert.deepEqual(ids(originalOffers), ['original']);
  assert.deepEqual(ids(analogueOffers), ['unpriced', 'expensive', 'cheap', 'unavailable']);
  assert.equal(offers[0].id, 'unpriced', 'does not change cached offers');
});

test('sorts analogues independently with unknown prices and stock last', () => {
  const byPrice = getOfferGroups(offers, { sort: 'price' });
  const byStock = getOfferGroups(offers, { sort: 'stock' });
  assert.deepEqual(ids(byPrice.originalOffers), ['original']);
  assert.deepEqual(ids(byStock.originalOffers), ['original']);
  assert.deepEqual(ids(byPrice.analogueOffers), ['cheap', 'unavailable', 'expensive', 'unpriced']);
  assert.deepEqual(ids(byStock.analogueOffers), ['expensive', 'cheap', 'unavailable', 'unpriced']);
});

test('filters availability only for analogues and keeps the unavailable requested part', () => {
  const filters = { onlyAvailable: true, sort: 'price' };
  const { originalOffers, analogueOffers } = getOfferGroups(offers, filters);
  assert.deepEqual(ids(originalOffers), ['original']);
  assert.equal(originalOffers[0].stock, 0);
  assert.deepEqual(ids(analogueOffers), ['cheap', 'expensive']);
  assert.deepEqual(getOfferGroups([], filters), { originalOffers: [], analogueOffers: [] });
  assert.deepEqual(getOfferGroups([offers[2]], filters), {
    originalOffers: [offers[2]],
    analogueOffers: [],
  });
});
