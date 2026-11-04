import { useRef } from 'react';
import Icon from './Icon.jsx';

export default function SearchForm({ value, onChange, onSearch, onExample }) {
  const inputRef = useRef(null);

  function submit(event) {
    event.preventDefault();
    if (!value.trim()) return inputRef.current?.focus();
    onSearch();
  }

  return (
    <form className="col-lg-10 col-xl-9 mx-auto text-start" onSubmit={submit}>
      <label htmlFor="part-number" className="visually-hidden">
        Артикул запчасти
      </label>
      <div className="row g-2">
        <div className="col-sm">
          <div className="input-group input-group-lg search-field bg-white rounded-3 shadow">
            <span className="input-group-text bg-transparent border-0 text-body-secondary">
              <Icon name="search" size={18} />
            </span>
            <input
              ref={inputRef}
              id="part-number"
              className="form-control border-0 bg-transparent font-monospace"
              type="text"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Например, 01089"
              maxLength={64}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-describedby="search-hint"
            />
            {value && (
              <button
                type="button"
                className="btn search-clear border-0 d-flex align-items-center justify-content-center p-0 flex-shrink-0"
                aria-label="Очистить артикул"
                onClick={() => {
                  onChange('');
                  inputRef.current?.focus();
                }}
              >
                <Icon name="close" size={18} className="pe-none" />
              </button>
            )}
          </div>
        </div>
        <div className="col-sm-auto">
          <button
            type="submit"
            className="btn btn-primary btn-lg fs-6 fw-semibold px-4 w-100 h-100"
            disabled={!value.trim()}
          >
            Найти запчасть
          </button>
        </div>
      </div>
      <div id="search-hint" className="d-flex flex-wrap align-items-center gap-2 small mt-3">
        <span className="opacity-75">Попробуйте:</span>
        {['01089', '7160500039S'].map((number) => (
          <button
            key={number}
            type="button"
            className="btn btn-sm btn-outline-light font-monospace"
            onClick={() => {
              onExample(number);
              inputRef.current?.focus();
            }}
          >
            {number}
          </button>
        ))}
      </div>
    </form>
  );
}
