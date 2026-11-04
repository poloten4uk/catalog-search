import usePartsSearch from './hooks/usePartsSearch.js';
import SearchForm from './components/SearchForm.jsx';
import ManufacturerPicker from './components/ManufacturerPicker.jsx';
import SearchResults from './components/SearchResults.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';

export default function App() {
  const search = usePartsSearch();

  return (
    <>
      <a className="visually-hidden-focusable position-absolute bg-white p-2 z-3" href="#main">
        Перейти к поиску
      </a>
      <header className="bg-white border-bottom py-3">
        <div className="container fw-semibold">Тестовый каталог автозапчастей</div>
      </header>
      <main id="main">
        <section
          className="search-hero text-white text-center py-4 py-md-5"
          aria-labelledby="search-title"
        >
          <div className="container">
            <h1 className="h2 fw-bold mb-2">Поиск запчастей и аналогов</h1>
            <p className="opacity-75 mb-4">
              Найдите производителя, сравните цены и подберите аналоги.
            </p>
            <h2 id="search-title" className="visually-hidden">
              Найдите запчасть
            </h2>
            <SearchForm
              value={search.input}
              onChange={search.changeNumber}
              onSearch={search.search}
              onExample={search.example}
            />
          </div>
        </section>
        {!search.isDebouncing && !search.manufacturers.isError && (
          <ManufacturerPicker
            brands={search.manufacturers.currentData || []}
            selectedBrand={search.selectedBrand}
            onSelect={search.selectBrand}
          />
        )}
        <div className="container py-4">
          <SearchResults
            number={search.number}
            selectedBrand={search.selectedBrand}
            isDebouncing={search.isDebouncing}
            manufacturers={search.manufacturers}
            offers={search.offers}
          />
          <p className="small text-body-secondary text-center mt-3 mb-0">
            Цены и наличие — по данным поставщика на момент запроса.
          </p>
        </div>
      </main>
      <ScrollToTop />
    </>
  );
}
