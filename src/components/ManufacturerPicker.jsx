import Icon from './Icon.jsx';

export default function ManufacturerPicker({ brands, selectedBrand, onSelect }) {
  if (!brands.length) return null;

  return (
    <section className="bg-white border-bottom" aria-labelledby="brands-title">
      <div className="container py-4">
        <div className="d-flex flex-wrap align-items-baseline gap-2 mb-3">
          <h2 id="brands-title" className="h6 mb-0">
            {brands.length === 1 ? 'Производитель' : 'Выберите производителя'}
          </h2>
          <span className="small text-body-secondary">{brands.length} найдено</span>
        </div>
        <div className="d-flex flex-wrap gap-2" role="group" aria-label="Производители">
          {brands.map((brand) => (
            <button
              type="button"
              key={brand.name}
              className={`btn brand-chip rounded-pill px-3 d-inline-flex align-items-center text-break mw-100 ${selectedBrand === brand.name ? 'active' : ''}`}
              aria-pressed={selectedBrand === brand.name}
              title={brand.description}
              onClick={() => onSelect(brand.name)}
            >
              {brand.name}
              <span className="brand-chip-check" aria-hidden="true">
                <span>
                  <Icon name="check" size={15} />
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
