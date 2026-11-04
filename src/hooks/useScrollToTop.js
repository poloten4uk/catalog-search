import { useEffect, useState } from 'react';

export default function useScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let wasVisible = false;
    function updateVisibility() {
      const nextVisible = window.scrollY > 600;
      if (nextVisible !== wasVisible) {
        wasVisible = nextVisible;
        setVisible(nextVisible);
      }
    }
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  function scrollToTop() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'instant' : 'smooth' });
  }

  return { visible, scrollToTop };
}
