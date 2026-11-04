export const API_URL = 'https://api.favorit-parts.ru/hs/hsprice/';
export const MISSING_KEY_MESSAGE = 'Не настроен ключ доступа к сервису запчастей.';

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const amount = (value) => {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

export function apiErrorMessage(error) {
  const message = typeof error === 'string' ? error : '';
  if (/quota/i.test(message)) return 'Лимит запросов к сервису исчерпан. Попробуйте позже.';
  if (/key/i.test(message)) return 'Сервис не принял ключ доступа. Попробуйте позже.';
  if (/number goods/i.test(message)) return 'Введите артикул запчасти.';
  return 'Сервис запчастей вернул ошибку. Попробуйте ещё раз.';
}

function normalizeGood(good, includeAnalogues = true) {
  if (!record(good) || !text(good.brand) || !text(good.number)) return null;
  return {
    id: text(good.goodsID),
    brand: text(good.brand),
    number: text(good.number),
    name: text(good.name) || 'Запчасть без названия',
    // The top-level price/count do not describe an individual offer.
    warehouses: (Array.isArray(good.warehouses) ? good.warehouses : [])
      .filter(record)
      .map((warehouse) => ({
        id: text(warehouse.id),
        code: text(warehouse.code) || 'Склад поставщика',
        shipping: text(warehouse.warehouseShipping),
        own: warehouse.own === true,
        price: amount(warehouse.price),
        stock: amount(warehouse.stock),
        shipmentDate: text(warehouse.shipmentDate),
      })),
    analogues:
      includeAnalogues && Array.isArray(good.analogues)
        ? good.analogues.map((item) => normalizeGood(item, false)).filter(Boolean)
        : [],
  };
}

export function parsePartsResponse(payload) {
  if (!record(payload)) throw new Error('Сервис вернул ответ в неизвестном формате.');
  if (payload.error) throw new Error(apiErrorMessage(payload.error));
  if (!Array.isArray(payload.goods)) throw new Error('Сервис вернул ответ в неизвестном формате.');
  const goods = [];
  for (const item of payload.goods) {
    if (!record(item)) throw new Error('Сервис вернул некорректные данные о запчастях.');
    const normalized = normalizeGood(item);
    if (normalized) {
      goods.push(normalized);
      continue;
    }
    // Live API uses a zero-filled placeholder, not only an empty object.
    const isEmpty =
      Object.keys(item).length === 0 ||
      (item.brand === '' &&
        item.number === '' &&
        item.name === '' &&
        item.count === 0 &&
        Array.isArray(item.warehouses) &&
        item.warehouses.length === 0);
    if (!isEmpty) throw new Error('Сервис вернул некорректные данные о запчастях.');
  }
  return goods;
}

export function getManufacturers(goods) {
  const brands = new Map();
  for (const good of goods) {
    const key = good.brand.toLocaleLowerCase('en');
    if (!brands.has(key)) brands.set(key, { name: good.brand, description: good.name });
  }
  return [...brands.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getOffers(goods) {
  const products = new Map();
  // Add requested products first so duplicates in analogues remain originals.
  const add = (good, isAnalogue) => {
    const key = JSON.stringify([good.brand.toLowerCase(), good.number.toLowerCase()]);
    const current = products.get(key);
    if (current) current.warehouses.push(...good.warehouses);
    else products.set(key, { ...good, warehouses: [...good.warehouses], isAnalogue });
  };
  goods.forEach((good) => add(good, false));
  goods.forEach((good) => good.analogues.forEach((analogue) => add(analogue, true)));

  return [...products.entries()].map(([productKey, good]) => {
    const warehouses = new Map();
    for (const warehouse of good.warehouses) {
      const key = JSON.stringify([
        warehouse.id,
        warehouse.code,
        warehouse.shipping,
        warehouse.shipmentDate,
        warehouse.price,
        warehouse.stock,
      ]);
      warehouses.set(key, warehouse);
    }
    const quotes = [...warehouses.entries()].map(([key, warehouse]) => ({ ...warehouse, key }));
    const available = quotes.filter((warehouse) => warehouse.stock > 0);
    const price = (available.length ? available : quotes).reduce(
      (minimum, warehouse) =>
        warehouse.price === null ? minimum : Math.min(minimum ?? warehouse.price, warehouse.price),
      null,
    );
    const hasUnknownStock = quotes.some((warehouse) => warehouse.stock === null);
    const stock = quotes.reduce((total, warehouse) => total + (warehouse.stock ?? 0), 0);

    return {
      id: productKey,
      brand: good.brand,
      number: good.number,
      name: good.name,
      isAnalogue: good.isAnalogue,
      price,
      stock: stock > 0 || !hasUnknownStock ? stock : null,
      hasUnknownStock,
      warehouses: quotes,
    };
  });
}

export function requestParams({ number, brand }, key) {
  const params = new URLSearchParams({ key, number: number.trim() });
  if (brand) {
    params.set('brand', brand);
    params.set('analogues', 'on');
  }
  return params;
}

export function queryErrorMessage(error) {
  if (error?.status === 'TIMEOUT_ERROR')
    return 'Сервис отвечает слишком долго. Попробуйте ещё раз.';
  if (error?.status === 'FETCH_ERROR')
    return 'Не удалось связаться с сервисом. Проверьте интернет и повторите запрос.';
  if (error?.status === 'CUSTOM_ERROR') return error.error;
  if (error?.status === 429) return 'Слишком много запросов. Подождите немного и повторите поиск.';
  return 'Не удалось загрузить данные. Попробуйте ещё раз.';
}
