import { memo, useState } from 'react';
import { formatPrice, formatStock } from '../utils/formatOffer.js';
import Icon from './Icon.jsx';

function QuantityStepper({ max }) {
  const [quantity, setQuantity] = useState(1);
  const limit = max > 0 ? max : Infinity;
  return (
    <div className="input-group input-group-lg flex-nowrap w-auto quantity-stepper">
      <button
        type="button"
        className="btn btn-light border"
        aria-label="Уменьшить количество"
        disabled={quantity <= 1}
        onClick={() => setQuantity((value) => Math.max(1, value - 1))}
      >
        −
      </button>
      <output
        className="input-group-text bg-white fs-6 fw-semibold justify-content-center px-3"
        aria-live="polite"
        aria-label="Количество"
      >
        {quantity}
      </output>
      <button
        type="button"
        className="btn btn-light border"
        aria-label="Увеличить количество"
        disabled={quantity >= limit}
        onClick={() => setQuantity((value) => Math.min(limit, value + 1))}
      >
        +
      </button>
    </div>
  );
}

const buyButton = 'btn btn-lg fs-6 fw-semibold text-nowrap flex-grow-1';

export default memo(function OriginalOfferCard({ offer }) {
  const inStock = offer.stock > 0;
  return (
    <article
      className="bg-white border border-primary-subtle rounded-4 overflow-hidden"
      aria-labelledby={`original-${offer.id}`}
    >
      <div className="bg-primary-subtle d-flex flex-wrap justify-content-between gap-2 px-3 px-md-4 py-2">
        <span className="small fw-bold text-uppercase text-primary-emphasis">
          То, что вы искали
        </span>
        <span className="small text-body-secondary d-none d-md-inline">
          Оригинальная позиция по вашему запросу
        </span>
      </div>
      <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3 gap-lg-4 p-3 p-md-4">
        <div className="flex-grow-1 text-break">
          <div className="small fw-bold text-uppercase text-body-secondary">{offer.brand}</div>
          <h3 id={`original-${offer.id}`} className="h4 fw-semibold mt-2 mb-3">
            {offer.name}
          </h3>
          <div className="d-flex flex-wrap align-items-center gap-3 small text-body-secondary">
            <span>
              Артикул{' '}
              <span className="font-monospace text-body bg-body-tertiary border rounded px-2 py-1">
                {offer.number}
              </span>
            </span>
            <span
              className={`d-inline-flex align-items-center gap-2 ${inStock ? 'text-success fw-semibold' : ''}`}
            >
              {inStock && <span className="p-1 rounded-circle bg-success" aria-hidden="true" />}
              {formatStock(offer.stock, offer.hasUnknownStock)}
              {inStock && ' в наличии'}
            </span>
          </div>
        </div>
        <hr className="d-lg-none my-0" />
        <div className="d-flex flex-column flex-sm-row flex-lg-column justify-content-between align-items-stretch align-items-sm-end align-items-lg-stretch gap-3 gap-lg-2 flex-shrink-0">
          <div className="text-lg-end">
            <div className="small text-body-secondary">Цена</div>
            <div className="fs-3 fw-bold text-nowrap">{formatPrice(offer.price, true)}</div>
          </div>
          {inStock ? (
            <div className="d-flex gap-2">
              <QuantityStepper max={offer.stock} />
              <button
                type="button"
                className={`${buyButton} btn-primary d-inline-flex align-items-center justify-content-center gap-2`}
              >
                <Icon name="cart" size={18} />В корзину
              </button>
            </div>
          ) : (
            <button type="button" className={`${buyButton} btn-outline-primary`}>
              Уведомить о поступлении
            </button>
          )}
        </div>
      </div>
    </article>
  );
});
