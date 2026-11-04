export default function OfferAction({ offer }) {
  return offer.stock > 0 ? (
    <button type="button" className="btn btn-outline-primary fw-semibold text-nowrap">
      В корзину
    </button>
  ) : (
    <button type="button" className="btn btn-link fw-semibold text-decoration-none">
      Уведомить
    </button>
  );
}
