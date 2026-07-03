export const bestellkanaele = ["Instagram", "Email", "Abo"] as const;

export const zahlungsstatusWerte = ["ausstehend", "bezahlt"] as const;

export const bestellstatusWerte = [
  "Eingegangen",
  "verbindlich",
  "storniert",
] as const;

export type Bestellkanal = (typeof bestellkanaele)[number];
export type Zahlungsstatus = (typeof zahlungsstatusWerte)[number];
export type Bestellstatus = (typeof bestellstatusWerte)[number];

export function isBestellkanal(value: string): value is Bestellkanal {
  return bestellkanaele.includes(value as Bestellkanal);
}

export function isZahlungsstatus(value: string): value is Zahlungsstatus {
  return zahlungsstatusWerte.includes(value as Zahlungsstatus);
}

export function isBestellstatus(value: string): value is Bestellstatus {
  return bestellstatusWerte.includes(value as Bestellstatus);
}

export function getBestellstatusForZahlung(
  zahlungsstatus: Zahlungsstatus,
): Bestellstatus {
  return zahlungsstatus === "bezahlt" ? "verbindlich" : "Eingegangen";
}
