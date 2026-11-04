import OfferCard from './OfferCard.jsx';

export default function OffersCards({ offers }) {
  return (
    <div className="d-lg-none px-3 pb-3" role="region" aria-label="Карточки аналогов">
      <ul className="row row-cols-1 row-cols-md-2 g-2 g-md-3 list-unstyled mb-0">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </ul>
    </div>
  );
}
