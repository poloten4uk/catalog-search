import OfferRow from './OfferRow.jsx';

export default function OffersTable({ offers }) {
  return (
    <div className="d-none d-lg-block" role="region" aria-label="Таблица аналогов">
      <table className="table table-hover align-middle mb-0 offers-table">
        <caption className="visually-hidden">
          Аналоги. Каждая строка — отдельный товар с общим остатком по складам.
        </caption>
        <thead className="sticky-top small text-uppercase">
          <tr>
            <th scope="col" className="ps-4 fw-semibold" style={{ width: '18%' }}>
              Бренд
            </th>
            <th scope="col" className="fw-semibold">
              Наименование
            </th>
            <th scope="col" className="fw-semibold">
              Артикул
            </th>
            <th scope="col" className="text-end text-nowrap fw-semibold">
              В наличии
            </th>
            <th scope="col" className="text-end fw-semibold">
              Цена
            </th>
            <th scope="col" className="pe-4">
              <span className="visually-hidden">Действие</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <OfferRow key={offer.id} offer={offer} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
