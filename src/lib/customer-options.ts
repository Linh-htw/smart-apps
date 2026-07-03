export const kundentypen = ["B2C", "B2B"] as const;

export const hauttypen = [
  "normale Haut",
  "ölige Haut",
  "trockene Haut",
  "Mischhaut",
] as const;

export type Kundentyp = (typeof kundentypen)[number];
export type Hauttyp = (typeof hauttypen)[number];

export function isKundentyp(value: string): value is Kundentyp {
  return kundentypen.includes(value as Kundentyp);
}

export function isHauttyp(value: string): value is Hauttyp {
  return hauttypen.includes(value as Hauttyp);
}
