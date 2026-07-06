export const lagerorte = ["Werkstatt", "Versandbereit", "Restposten"] as const;

export type Lagerort = (typeof lagerorte)[number];

export function isLagerort(value: string): value is Lagerort {
  return lagerorte.includes(value as Lagerort);
}
