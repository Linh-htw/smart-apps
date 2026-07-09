export const retourenstatusWerte = [
  "Angemeldet",
  "Eingegangen",
  "In Pruefung",
  "Angenommen",
  "Abgelehnt",
  "Abgeschlossen",
] as const;

export const produktzustandWerte = [
  "Ungeoeffnet",
  "Geoeffnet",
  "Beschaedigt",
  "Mangelhaft",
] as const;

export const erstattungsarten = [
  "Keine",
  "Gutschein",
  "Geld zurueck",
  "Ersatzprodukt",
] as const;

export type Retourenstatus = (typeof retourenstatusWerte)[number];
export type Produktzustand = (typeof produktzustandWerte)[number];
export type Erstattungsart = (typeof erstattungsarten)[number];

export function isRetourenstatus(value: string): value is Retourenstatus {
  return retourenstatusWerte.includes(value as Retourenstatus);
}

export function isProduktzustand(value: string): value is Produktzustand {
  return produktzustandWerte.includes(value as Produktzustand);
}

export function isErstattungsart(value: string): value is Erstattungsart {
  return erstattungsarten.includes(value as Erstattungsart);
}
