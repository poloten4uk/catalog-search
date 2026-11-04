import useScrollToTop from '../hooks/useScrollToTop.js';
import Icon from './Icon.jsx';

export default function ScrollToTop() {
  const { visible, scrollToTop } = useScrollToTop();
  if (!visible) return null;

  return (
    <button
      type="button"
      className="btn btn-primary position-fixed bottom-0 end-0 m-3 rounded-circle p-3 shadow d-inline-flex align-items-center justify-content-center z-3"
      aria-label="Наверх"
      title="Наверх"
      onClick={scrollToTop}
    >
      <Icon name="arrowUp" size={20} />
    </button>
  );
}
