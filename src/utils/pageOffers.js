export const PAGE_SIZE = 50;

// Returns the slice to render and how many more items the next "show more" adds.
export function pageOffers(offers, visibleCount) {
  const visible = offers.slice(0, visibleCount);
  return { visible, nextCount: Math.min(PAGE_SIZE, offers.length - visible.length) };
}

export const showMore = (visibleCount, total) => Math.min(visibleCount + PAGE_SIZE, total);
