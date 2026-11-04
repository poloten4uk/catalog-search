import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatAnalogues, formatPrice, formatStock } from './formatOffer.js';

// Intl separates thousands and the currency sign with non-breaking spaces.
const plain = (text) => text.replace(/\s/g, ' ');

test('formats prices in roubles with kopecks and an optional "from" prefix', () => {
  assert.equal(plain(formatPrice(1082)), '1 082,00 ₽');
  assert.equal(plain(formatPrice(271.45, true)), 'от 271,45 ₽');
  assert.equal(plain(formatPrice(0)), '0,00 ₽');
});

test('shows a dash instead of a price when the price is unknown', () => {
  assert.equal(formatPrice(null), '—');
  assert.equal(formatPrice(null, true), '—');
});

test('distinguishes unknown, absent and confirmed stock', () => {
  assert.equal(formatStock(null), 'Наличие не указано');
  assert.equal(formatStock(0), 'Нет в наличии');
  assert.equal(formatStock(0, true), 'Нет в наличии');
  assert.equal(plain(formatStock(912)), '912 шт.');
  assert.equal(plain(formatStock(12500)), '12 500 шт.');
});

test('marks stock as a lower bound when some warehouses did not report it', () => {
  assert.equal(plain(formatStock(53, true)), 'Не менее 53 шт.');
});

test('declines the word "аналог" for Russian plural forms', () => {
  const cases = {
    1: '1 аналог',
    2: '2 аналога',
    4: '4 аналога',
    5: '5 аналогов',
    11: '11 аналогов',
    14: '14 аналогов',
    21: '21 аналог',
    22: '22 аналога',
    43: '43 аналога',
    50: '50 аналогов',
    111: '111 аналогов',
    0: '0 аналогов',
  };
  for (const [count, expected] of Object.entries(cases)) {
    assert.equal(plain(formatAnalogues(Number(count))), expected);
  }
});
