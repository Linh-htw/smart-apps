export const lagerorte = ["Werkstatt", "Markt-Truck", "Zuhause"] as const;

export type Lagerort = (typeof lagerorte)[number];

export function isLagerort(value: string): value is Lagerort {
  return lagerorte.includes(value as Lagerort);
}
