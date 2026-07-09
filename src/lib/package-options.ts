export const paketstatusWerte = [
  "Vorbereitet",
  "Gepackt",
  "Versendet",
  "Zugestellt",
] as const;

export const versandoptionen = ["DHL", "DHL Express"] as const;

export type Paketstatus = (typeof paketstatusWerte)[number];
export type Versandoption = (typeof versandoptionen)[number];

export function isPaketstatus(value: string): value is Paketstatus {
  return paketstatusWerte.includes(value as Paketstatus);
}

export function isVersandoption(value: string): value is Versandoption {
  return versandoptionen.includes(value as Versandoption);
}
