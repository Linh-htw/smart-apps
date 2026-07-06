export const rollen = ["Admin", "Werkstatt-Hilfe", "Packer"] as const;

export type Rolle = (typeof rollen)[number];

export function isRolle(value: string): value is Rolle {
  return rollen.includes(value as Rolle);
}
