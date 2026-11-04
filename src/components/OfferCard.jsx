import { memo } from 'react';
import { formatPrice, formatStock } from '../utils/formatOffer.js';
import OfferAction from './OfferAction.jsx';

export default memo(function OfferCard({ offer }) {
  const inStock = offer.stock > 0;
  return (
    <li className="col">
      <div className="h-100 d-flex flex-column border rounded-3 p-3">
        <div className="d-flex align-items-baseline justify-content-between gap-3">
          <span className="fw-semibold text-break">{offer.brand}</span>
          <span className="font-monospace small text-body-secondary text-break">
            {offer.number}
          </span>
        </div>
        <div className="small text-body-secondary text-break mt-1 mb-3">{offer.name}</div>
        <div className="mt-auto pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            {offer.price !== null && (
              <div className="fw-bold">{formatPrice(offer.price, true)}</div>
            )}
            <div
              className={`small ${inStock ? 'text-success fw-semibold' : 'text-body-secondary'}`}
            >
              {formatStock(offer.stock, offer.hasUnknownStock)}
            </div>
          </div>
          <OfferAction offer={offer} />
        </div>
      </div>
    </li>
  );
});
