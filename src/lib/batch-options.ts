export const chargenstatusWerte = ["freigegeben", "gesperrt"] as const;

export type Chargenstatus = (typeof chargenstatusWerte)[number];

export function isChargenstatus(value: string): value is Chargenstatus {
  return chargenstatusWerte.includes(value as Chargenstatus);
}
