export const produktkategorien = [
  "Seifen",
  "Öle",
  "Balsam",
  "Bodylotions",
] as const;

export type Produktkategorie = (typeof produktkategorien)[number];

export function isProduktkategorie(
  value: string,
): value is Produktkategorie {
  return produktkategorien.includes(value as Produktkategorie);
}
