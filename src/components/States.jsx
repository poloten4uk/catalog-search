import Icon from './Icon.jsx';

export function Loading({ label }) {
  return (
    <div
      className="d-flex justify-content-center align-items-center gap-2 py-5 text-body-secondary"
      role="status"
    >
      <span
        className="spinner-border spinner-border-sm text-primary flex-shrink-0"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div
      className="alert alert-danger d-flex flex-column flex-sm-row align-items-start gap-3 mb-0"
      role="alert"
    >
      <Icon name="warning" size={24} className="flex-shrink-0" />
      <div className="flex-grow-1">
        <strong>Не получилось загрузить данные</strong>
        <p className="mb-0 mt-1">{message}</p>
      </div>
      <button
        type="button"
        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-2 text-nowrap"
        onClick={onRetry}
      >
        <Icon name="refresh" size={16} />
        Повторить
      </button>
    </div>
  );
}

export function EmptyState({ mode = 'start', number }) {
  const states = {
    start: [
      'Поиск начинается с артикула',
      'Введите номер с упаковки или самой детали. Найдём производителей, а затем покажем цены и аналоги.',
    ],
    brand: [
      'Осталось выбрать производителя',
      'У разных брендов артикулы могут совпадать. Выберите нужный бренд, чтобы увидеть подходящие предложения.',
    ],
    notFound: [
      'По этому артикулу ничего не найдено',
      `Проверьте номер «${number}» или попробуйте другой артикул.`,
    ],
    noOffers: [
      'Предложения не найдены',
      'Попробуйте выбрать другого производителя или изменить артикул.',
    ],
    noAnalogues: ['Аналоги не найдены', 'Для этой детали поставщик не вернул аналогов.'],
    filter: [
      'Нет предложений с такими условиями',
      'Отключите фильтр наличия, чтобы увидеть все предложения.',
    ],
  };
  const [title, description] = states[mode];
  return (
    <div className="text-center py-4">
      <Icon name={mode === 'brand' ? 'layers' : 'box'} size={36} className="text-primary mb-3" />
      <h3 className="h6">{title}</h3>
      <p className="text-body-secondary mb-0">{description}</p>
    </div>
  );
}
