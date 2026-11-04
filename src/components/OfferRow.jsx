import { memo } from 'react';
import { formatPrice, formatStock } from '../utils/formatOffer.js';
import OfferAction from './OfferAction.jsx';

export default memo(function OfferRow({ offer }) {
  const inStock = offer.stock > 0;
  return (
    <tr>
      <td className="ps-4 fw-semibold text-break">{offer.brand}</td>
      <td className="text-break">
        <span className="text-body-secondary">{offer.name}</span>
      </td>
      <td>
        <span className="font-monospace small text-nowrap">{offer.number}</span>
      </td>
      <td className="text-end text-nowrap">
        <span className={inStock ? 'text-success fw-semibold' : 'text-body-secondary'}>
          {formatStock(offer.stock, offer.hasUnknownStock)}
        </span>
      </td>
      <td className="text-end text-nowrap fw-bold">{formatPrice(offer.price, true)}</td>
      <td className="text-end pe-4">
        <OfferAction offer={offer} />
      </td>
    </tr>
  );
});
