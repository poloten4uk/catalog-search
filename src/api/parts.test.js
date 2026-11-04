import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getManufacturers,
  getOffers,
  parsePartsResponse,
  requestParams,
  queryErrorMessage,
} from './parts.js';

const good = (overrides = {}) => ({
  goodsID: 'part-1',
  brand: 'OSSCA',
  number: '01089',
  name: 'Стеклоподъемник',
  price: 999999,
  count: 999999,
  warehouses: [{ id: 'w1', code: 'МСК', price: 1061.4, stock: 10 }],
  ...overrides,
});

test('uses warehouse prices/stocks instead of obsolete top-level fields', () => {
  const offers = getOffers(parsePartsResponse({ goods: [good()] }));
  assert.equal(offers.length, 1);
  assert.equal(offers[0].price, 1061.4);
  assert.equal(offers[0].stock, 10);
});

test('recognizes documented empty answers and preserves zero-stock goods', () => {
  assert.deepEqual(parsePartsResponse({ goods: [{}] }), []);
  assert.deepEqual(parsePartsResponse({ goods: [] }), []);
  const [offer] = getOffers(parsePartsResponse({ goods: [good({ warehouses: [] })] }));
  assert.equal(offer.stock, 0);
  assert.equal(offer.price, null);
  assert.deepEqual(offer.warehouses, []);
});

test('groups warehouse offers into one product per analogue', () => {
  const analogue = good({
    brand: 'FEBI',
    number: '123',
    warehouses: [
      { id: 'w2', price: 15, stock: 0 },
      { id: 'w3', price: 25, stock: 2 },
    ],
  });
  const offers = getOffers(parsePartsResponse({ goods: [good({ analogues: [analogue] })] }));
  assert.equal(offers.length, 2);
  const grouped = offers.find((offer) => offer.isAnalogue);
  assert.equal(grouped.warehouses.length, 2);
  assert.equal(grouped.stock, 2);
  assert.equal(grouped.price, 25, 'does not advertise the lower out-of-stock price');
  assert.equal(new Set(offers.map((offer) => offer.id)).size, 2);
});

test('merges matching brands and articles without mixing different products', () => {
  const data = parsePartsResponse({
    goods: [
      good(),
      good({
        brand: 'ossca',
        warehouses: [{ id: 'w2', code: 'СПБ', price: 900, stock: 3 }],
      }),
      good({ brand: 'FEBI' }),
      good({ number: '01090' }),
    ],
  });
  const offers = getOffers(data);
  assert.equal(offers.length, 3);
  assert.equal(offers[0].stock, 13);
  assert.equal(offers[0].price, 900);
  assert.equal(offers[0].warehouses.length, 2);
  assert.equal(new Set(offers.map((offer) => offer.id)).size, 3);
});

test('uses the minimum available price without borrowing an unavailable quote', () => {
  const [offer] = getOffers(
    parsePartsResponse({
      goods: [
        good({
          warehouses: [
            { id: 'w1', price: 1, stock: 0 },
            { id: 'w2', price: 40, stock: 3 },
            { id: 'w3', price: 20, stock: 2 },
          ],
        }),
      ],
    }),
  );
  assert.equal(offer.price, 20);
  assert.equal(offer.stock, 5);

  const [unpriced] = getOffers(
    parsePartsResponse({
      goods: [
        good({
          warehouses: [
            { id: 'w1', price: 1, stock: 0 },
            { id: 'w2', price: null, stock: 2 },
          ],
        }),
      ],
    }),
  );
  assert.equal(unpriced.price, null);
  assert.equal(unpriced.stock, 2);
});

test('keeps an unknown total distinct from a confirmed zero stock', () => {
  for (const stocks of [[null], [0, null]]) {
    const [offer] = getOffers(
      parsePartsResponse({
        goods: [
          good({
            warehouses: stocks.map((stock, index) => ({ id: `w${index}`, price: 10, stock })),
          }),
        ],
      }),
    );
    assert.equal(offer.stock, null);
    assert.equal(offer.hasUnknownStock, true);
  }
  const [zero] = getOffers(
    parsePartsResponse({ goods: [good({ warehouses: [{ id: 'w1', price: 10, stock: 0 }] })] }),
  );
  assert.equal(zero.stock, 0);
  assert.equal(zero.hasUnknownStock, false);
  assert.equal(zero.price, 10);
});

test('recognizes the zero-filled not-found placeholder returned by the live API', () => {
  const response = {
    goods: [
      {
        brand: '',
        count: 0,
        goodsID: '00000000-0000-0000-0000-000000000000',
        name: '',
        number: '',
        price: 0,
        rate: 0,
        warehouses: [],
      },
    ],
  };
  assert.deepEqual(parsePartsResponse(response), []);
});

test('deduplicates products and identical offers, keeping requested products original', () => {
  const data = parsePartsResponse({ goods: [good({ analogues: [good(), good()] }), good()] });
  const offers = getOffers(data);
  assert.equal(offers.length, 1);
  assert.equal(offers[0].isAnalogue, false);
  assert.equal(offers[0].stock, 10, 'repeated products do not multiply stock');
  assert.equal(offers[0].warehouses.length, 1);
  assert.equal(data[0].warehouses.length, 1, 'does not mutate cached data');
});

test('deduplicates manufacturers case-insensitively', () => {
  const brands = getManufacturers(
    parsePartsResponse({ goods: [good(), good({ brand: 'ossca' }), good({ brand: 'FEBI' })] }),
  );
  assert.deepEqual(
    brands.map((brand) => brand.name),
    ['FEBI', 'OSSCA'],
  );
});

test('rejects API errors and unexpected responses rather than showing empty success', () => {
  assert.throws(() => parsePartsResponse({ error: 'Invalid key client!' }), /ключ/);
  assert.throws(() => parsePartsResponse({ error: 'Request quota exceeded!' }), /Лимит/);
  for (const payload of [
    null,
    '<html>error</html>',
    [],
    {},
    { goods: {} },
    { goods: [null] },
    { goods: [{ strange: true }] },
  ]) {
    assert.throws(() => parsePartsResponse(payload));
  }
});

test('handles unexpected numbers without inventing price or stock', () => {
  const items = [
    { id: 'w1', price: '12.50', stock: '7' },
    { id: 'w2', price: null, stock: '' },
    { id: 'w3', price: -1, stock: false },
  ];
  const offers = getOffers(parsePartsResponse({ goods: [good({ warehouses: items })] }));
  assert.deepEqual(
    offers[0].warehouses.map(({ price, stock }) => [price, stock]),
    [
      [12.5, 7],
      [null, null],
      [null, null],
    ],
  );
  assert.equal(offers[0].stock, 7);
  assert.equal(offers[0].hasUnknownStock, true, 'the known sum is only a lower bound');
  assert.equal(offers[0].price, 12.5);
});

test('encodes special characters and only asks for analogues after choosing a brand', () => {
  const first = requestParams({ number: ' #12&34 ' }, 'example');
  assert.equal(first.get('number'), '#12&34');
  assert.equal(first.has('analogues'), false);
  const second = requestParams({ number: '01089', brand: 'Meat & Doria' }, 'example');
  assert.equal(second.get('brand'), 'Meat & Doria');
  assert.match(second.toString(), /Meat\+%26\+Doria/);
  assert.equal(second.get('analogues'), 'on');
});

test('keeps external strings as data and never exposes raw upstream errors', () => {
  const [item] = parsePartsResponse({ goods: [good({ name: '<img src=x onerror=alert(1)>' })] });
  assert.equal(item.name, '<img src=x onerror=alert(1)>');
  assert.throws(
    () => parsePartsResponse({ error: 'Secret internal system detail' }),
    (error) => !error.message.includes('Secret'),
  );
  assert.match(queryErrorMessage({ status: 'FETCH_ERROR' }), /интернет/);
  assert.match(queryErrorMessage({ status: 'TIMEOUT_ERROR' }), /долго/);
});
