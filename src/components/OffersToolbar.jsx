const sortOptions = [
  ['default', 'По умолчанию'],
  ['price', 'Сначала дешевле'],
  ['stock', 'Больше в наличии'],
];

export default function OffersToolbar({ filters, onChange }) {
  const { onlyAvailable, sort } = filters;
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
      <label className="form-check form-switch fw-medium mb-0">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          checked={onlyAvailable}
          onChange={(event) => onChange('onlyAvailable', event.target.checked)}
        />
        <span className="form-check-label">В наличии</span>
      </label>
      <select
        className="form-select form-select-sm w-auto d-lg-none"
        aria-label="Сортировка аналогов"
        value={sort}
        onChange={(event) => onChange('sort', event.target.value)}
      >
        {sortOptions.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <div
        className="d-none d-lg-inline-flex gap-1 p-1 rounded-3 bg-body-secondary"
        role="group"
        aria-label="Сортировка аналогов"
      >
        {sortOptions.map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`btn btn-sm border-0 ${sort === value ? 'bg-white shadow-sm' : 'text-body-secondary'}`}
            aria-pressed={sort === value}
            onClick={() => onChange('sort', value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
