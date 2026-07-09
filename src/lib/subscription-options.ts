export const aboBoxStatusWerte = ["aktiv", "pausiert", "gekuendigt"] as const;

export type AboBoxStatus = (typeof aboBoxStatusWerte)[number];

export function isAboBoxStatus(value: string): value is AboBoxStatus {
  return aboBoxStatusWerte.includes(value as AboBoxStatus);
}
