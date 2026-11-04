import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query';
import { partsApi, useGetManufacturersQuery, useGetOffersQuery } from '../api/partsApi.js';

const CACHE_SECONDS = 60;

export default function usePartsSearch() {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const [searchedNumber, setSearchedNumber] = useState('');
  const [manualBrand, setManualBrand] = useState(null);
  const number = input.trim();
  const isDebouncing = number !== searchedNumber;

  useEffect(() => {
    const timer = setTimeout(() => setSearchedNumber(number), 450);
    return () => clearTimeout(timer);
  }, [number]);

  const manufacturers = useGetManufacturersQuery(
    number && !isDebouncing ? searchedNumber : skipToken,
    { refetchOnMountOrArgChange: CACHE_SECONDS },
  );
  const selectedBrand =
    manualBrand ??
    (manufacturers.currentData?.length === 1 ? manufacturers.currentData[0].name : null);
  const offers = useGetOffersQuery(
    selectedBrand && number && !isDebouncing
      ? { number: searchedNumber, brand: selectedBrand }
      : skipToken,
    { refetchOnMountOrArgChange: CACHE_SECONDS },
  );

  function cancelOffers() {
    if (!selectedBrand) return;
    dispatch(
      partsApi.util.getRunningQueryThunk('getOffers', {
        number: searchedNumber,
        brand: selectedBrand,
      }),
    )?.abort();
  }

  function changeNumber(value) {
    if (value.trim() !== number) {
      dispatch(partsApi.util.getRunningQueryThunk('getManufacturers', searchedNumber))?.abort();
      cancelOffers();
      setManualBrand(null);
    }
    setInput(value);
    if (!value.trim()) setSearchedNumber('');
  }

  function selectBrand(brand) {
    if (brand === selectedBrand) return;
    cancelOffers();
    setManualBrand(brand);
  }

  function search() {
    if (!number) return;
    if (isDebouncing) {
      setSearchedNumber(number);
      return;
    }
    const expired =
      manufacturers.fulfilledTimeStamp &&
      Date.now() - manufacturers.fulfilledTimeStamp >= CACHE_SECONDS * 1000;
    if (!manufacturers.isFetching && (manufacturers.isError || expired)) {
      manufacturers.refetch();
    }
  }

  function example(value) {
    changeNumber(value);
    setSearchedNumber(value.trim());
  }

  return {
    input,
    number,
    selectedBrand,
    isDebouncing,
    manufacturers,
    offers,
    changeNumber,
    selectBrand,
    search,
    example,
  };
}
