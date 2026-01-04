export const TUNISIA_GOVERNORATES = [
  { name: 'Tunis', shippingCost: 7 },
  { name: 'Ariana', shippingCost: 7 },
  { name: 'Ben Arous', shippingCost: 7 },
  { name: 'Manouba', shippingCost: 7 },
  { name: 'Nabeul', shippingCost: 8 },
  { name: 'Zaghouan', shippingCost: 8 },
  { name: 'Bizerte', shippingCost: 8 },
  { name: 'Béja', shippingCost: 9 },
  { name: 'Jendouba', shippingCost: 10 },
  { name: 'Kef', shippingCost: 10 },
  { name: 'Siliana', shippingCost: 9 },
  { name: 'Sousse', shippingCost: 8 },
  { name: 'Monastir', shippingCost: 8 },
  { name: 'Mahdia', shippingCost: 9 },
  { name: 'Sfax', shippingCost: 9 },
  { name: 'Kairouan', shippingCost: 9 },
  { name: 'Kasserine', shippingCost: 10 },
  { name: 'Sidi Bouzid', shippingCost: 10 },
  { name: 'Gabès', shippingCost: 11 },
  { name: 'Medenine', shippingCost: 12 },
  { name: 'Tataouine', shippingCost: 13 },
  { name: 'Gafsa', shippingCost: 11 },
  { name: 'Tozeur', shippingCost: 12 },
  { name: 'Kebili', shippingCost: 12 },
] as const;

export function getShippingCost(governorate: string): number {
  const gov = TUNISIA_GOVERNORATES.find(
    (g) => g.name.toLowerCase() === governorate.toLowerCase(),
  );
  return gov ? gov.shippingCost : 10; // Default shipping cost
}
