import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAGE_SIZE, pageOffers, showMore } from './pageOffers.js';

const list = (length) => Array.from({ length }, (_, index) => index);

test('shows the first page and offers the next full page', () => {
  const { visible, nextCount } = pageOffers(list(193), PAGE_SIZE);
  assert.equal(visible.length, 50);
  assert.deepEqual(visible.slice(0, 3), [0, 1, 2]);
  assert.equal(nextCount, 50);
});

test('steps through pages and offers only the remainder at the end', () => {
  const offers = list(193);
  let visibleCount = PAGE_SIZE;
  const steps = [];
  while (pageOffers(offers, visibleCount).nextCount > 0) {
    steps.push(pageOffers(offers, visibleCount).nextCount);
    visibleCount = showMore(visibleCount, offers.length);
  }
  assert.deepEqual(steps, [50, 50, 43]);
  assert.equal(visibleCount, 193);
  assert.equal(pageOffers(offers, visibleCount).visible.length, 193);
});

test('offers nothing more when everything fits on the first page', () => {
  assert.deepEqual(pageOffers(list(6), PAGE_SIZE), { visible: list(6), nextCount: 0 });
  assert.deepEqual(pageOffers(list(50), PAGE_SIZE).nextCount, 0);
  assert.deepEqual(pageOffers([], PAGE_SIZE), { visible: [], nextCount: 0 });
});

test('never counts past the end when the list shrinks below the visible count', () => {
  const { visible, nextCount } = pageOffers(list(30), 100);
  assert.equal(visible.length, 30);
  assert.equal(nextCount, 0);
  assert.equal(showMore(100, 30), 30);
});
