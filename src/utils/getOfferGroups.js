export function getOfferGroups(offers, { onlyAvailable, sort }) {
  const originalOffers = [];
  const analogueOffers = [];
  for (const offer of offers) {
    if (!offer.isAnalogue) originalOffers.push(offer);
    else if (!onlyAvailable || offer.stock > 0) analogueOffers.push(offer);
  }
  if (sort === 'price') {
    analogueOffers.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  }
  if (sort === 'stock') {
    analogueOffers.sort((a, b) => (b.stock ?? -1) - (a.stock ?? -1));
  }
  return { originalOffers, analogueOffers };
}
