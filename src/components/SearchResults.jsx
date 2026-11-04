import { useState } from 'react';
import { queryErrorMessage } from '../api/parts.js';
import { DEFAULT_FILTERS } from '../hooks/useOffersResults.js';
import { EmptyState, ErrorState, Loading } from './States.jsx';
import OffersResults from './OffersResults.jsx';

function StatePanel({ children }) {
  return <div className="bg-white border rounded-4 overflow-hidden p-3 p-md-4">{children}</div>;
}

function ResultsContent({
  number,
  selectedBrand,
  busyBrands,
  manufacturers,
  offers,
  filters,
  onFiltersChange,
}) {
  if (!number)
    return (
      <StatePanel>
        <EmptyState />
      </StatePanel>
    );
  if (busyBrands)
    return (
      <StatePanel>
        <Loading label="Ищем производителей…" />
      </StatePanel>
    );
  if (manufacturers.isError) {
    return (
      <StatePanel>
        <ErrorState
          message={queryErrorMessage(manufacturers.error)}
          onRetry={manufacturers.refetch}
        />
      </StatePanel>
    );
  }
  if (manufacturers.isSuccess && !manufacturers.currentData?.length) {
    return (
      <StatePanel>
        <EmptyState mode="notFound" number={number} />
      </StatePanel>
    );
  }
  if (!selectedBrand)
    return (
      <StatePanel>
        <EmptyState mode="brand" />
      </StatePanel>
    );
  if (offers.isFetching || offers.isUninitialized) {
    return (
      <StatePanel>
        <Loading label="Загружаем предложения и аналоги…" />
      </StatePanel>
    );
  }
  if (offers.isError) {
    return (
      <StatePanel>
        <ErrorState message={queryErrorMessage(offers.error)} onRetry={offers.refetch} />
      </StatePanel>
    );
  }
  if (!offers.currentData?.length)
    return (
      <StatePanel>
        <EmptyState mode="noOffers" />
      </StatePanel>
    );
  return (
    <OffersResults
      key={`${number}:${selectedBrand}`}
      offers={offers.currentData}
      filters={filters}
      onFiltersChange={onFiltersChange}
    />
  );
}

export default function SearchResults({
  number,
  selectedBrand,
  isDebouncing,
  manufacturers,
  offers,
}) {
  const busyBrands = Boolean(number) && (isDebouncing || manufacturers.isFetching);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  return (
    <section
      aria-labelledby="results-title"
      aria-busy={busyBrands || Boolean(selectedBrand && offers.isFetching)}
    >
      <h2 id="results-title" className="visually-hidden">
        Предложения и аналоги
        {selectedBrand && ` ${selectedBrand} ${number}`}
      </h2>
      <div aria-live="polite" aria-atomic="false">
        <ResultsContent
          number={number}
          selectedBrand={selectedBrand}
          busyBrands={busyBrands}
          manufacturers={manufacturers}
          offers={offers}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>
    </section>
  );
}
