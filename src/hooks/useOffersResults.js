import { useMemo, useRef, useState } from 'react';
import { getOfferGroups } from '../utils/getOfferGroups.js';
import { PAGE_SIZE, pageOffers, showMore } from '../utils/pageOffers.js';

export const DEFAULT_FILTERS = { onlyAvailable: false, sort: 'default' };

// Filters are owned by the caller so they survive a change of manufacturer.
export default function useOffersResults(offers, filters, setFilters) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const resultsRef = useRef(null);
  const { originalOffers, analogueOffers: filtered } = useMemo(
    () => getOfferGroups(offers, filters),
    [offers, filters],
  );
  const { visible: visibleOffers, nextCount } = pageOffers(filtered, visibleCount);

  function loadMore() {
    setVisibleCount((current) => showMore(current, filtered.length));
  }

  function changeFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
    setVisibleCount(PAGE_SIZE);
    if (resultsRef.current?.getBoundingClientRect().top < 0) {
      resultsRef.current.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }

  return {
    changeFilter,
    originalOffers,
    analoguesCount: offers.length - originalOffers.length,
    analogueOffers: visibleOffers,
    total: filtered.length,
    resultsRef,
    nextCount,
    loadMore,
  };
}
