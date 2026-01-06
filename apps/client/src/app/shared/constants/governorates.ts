export const TUNISIA_GOVERNORATES = [
  { name: 'Grand Tunis', shippingCost: 200 },
  { name: 'Sousse', shippingCost: 200 },
  { name: 'Bizerte', shippingCost: 200 },
  { name: 'Mounastir', shippingCost: 250 },
  { name: 'Mahdia', shippingCost: 250 },
  { name: 'Sfax', shippingCost: 250 },
  { name: 'Nabeul', shippingCost: 250 },
  { name: 'Zaghouan', shippingCost: 250 },
  { name: 'Béja', shippingCost: 250 },
  { name: 'Jendouba', shippingCost: 300 },
  { name: 'Kef', shippingCost: 250 },
  { name: 'Kairouan', shippingCost: 250 },
  { name: 'Gabès', shippingCost: 300 },
  { name: 'Gafsa', shippingCost: 250 },
  { name: 'Tozeur', shippingCost: 350 },
  { name: 'Kebili', shippingCost: 350 },
] as const;

export function getShippingCost(governorate: string): number {
  const gov = TUNISIA_GOVERNORATES.find(
    (g) => g.name.toLowerCase() === governorate.toLowerCase(),
  );
  return gov ? gov.shippingCost : 0; // Default shipping cost
}
