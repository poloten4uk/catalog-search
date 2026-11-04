const currency = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
});
const integer = new Intl.NumberFormat('ru-RU');
const plural = new Intl.PluralRules('ru-RU');

export const formatPrice = (price, from = false) =>
  price === null ? '—' : `${from ? 'от ' : ''}${currency.format(price)}`;

export function formatStock(stock, hasUnknownStock = false) {
  if (stock === null) return 'Наличие не указано';
  if (stock === 0) return 'Нет в наличии';
  return `${hasUnknownStock ? 'Не менее ' : ''}${integer.format(stock)} шт.`;
}

const analogueForms = { one: 'аналог', few: 'аналога', many: 'аналогов', other: 'аналога' };

export const formatAnalogues = (count) =>
  `${integer.format(count)} ${analogueForms[plural.select(count)]}`;
