import useOffersResults from '../hooks/useOffersResults.js';
import { formatAnalogues } from '../utils/formatOffer.js';
import Icon from './Icon.jsx';
import { EmptyState } from './States.jsx';
import OffersCards from './OffersCards.jsx';
import OffersTable from './OffersTable.jsx';
import OffersToolbar from './OffersToolbar.jsx';
import OriginalOfferCard from './OriginalOfferCard.jsx';

export default function OffersResults({ offers, filters, onFiltersChange }) {
  const {
    changeFilter,
    originalOffers,
    analoguesCount,
    analogueOffers,
    total,
    resultsRef,
    nextCount,
    loadMore,
  } = useOffersResults(offers, filters, onFiltersChange);

  return (
    <div className="d-flex flex-column gap-4">
      {originalOffers.map((offer) => (
        <OriginalOfferCard key={offer.id} offer={offer} />
      ))}
      <section
        ref={resultsRef}
        className="bg-white border rounded-4 overflow-hidden"
        aria-labelledby="analogues-title"
      >
        <div className="d-flex flex-column gap-3 p-3 p-md-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-2">
              <h3 id="analogues-title" className="h4 fw-bold mb-0">
                Аналоги
              </h3>
              {analoguesCount > 0 && (
                <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis">
                  {total}
                </span>
              )}
            </div>
            {analoguesCount > 0 && (
              <div className="small text-body-secondary" role="status">
                {nextCount > 0 ? (
                  <>
                    Показано <strong className="text-body">{analogueOffers.length}</strong>
                  </>
                ) : (
                  <span className="visually-hidden">Аналогов: {total}</span>
                )}
              </div>
            )}
          </div>
          {analoguesCount > 0 && <OffersToolbar filters={filters} onChange={changeFilter} />}
        </div>
        {!total ? (
          <div className="px-3 pb-4">
            <EmptyState mode={analoguesCount ? 'filter' : 'noAnalogues'} />
          </div>
        ) : (
          <>
            <OffersCards offers={analogueOffers} />
            <OffersTable offers={analogueOffers} />
            {nextCount > 0 && (
              <div className="border-top text-center p-3 p-md-4">
                <button
                  type="button"
                  className="btn btn-outline-primary fw-semibold px-4 d-inline-flex align-items-center gap-2"
                  onClick={loadMore}
                >
                  Показать ещё {formatAnalogues(nextCount)}
                  <Icon name="chevronDown" size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
