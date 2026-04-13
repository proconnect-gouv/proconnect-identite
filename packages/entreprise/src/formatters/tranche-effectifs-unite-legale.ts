//

const TRANCHE_EFFECTIFS_UNITE_LEGALE_LABELS: Record<string, string> = {
  NN: "Unité non employeuse",
  "00": "0 salarié",
  "01": "1 ou 2 salariés",
  "02": "3 à 5 salariés",
  "03": "6 à 9 salariés",
  "11": "10 à 19 salariés",
  "12": "20 à 49 salariés",
  "21": "50 à 99 salariés",
  "22": "100 à 199 salariés",
  "31": "200 à 249 salariés",
  "32": "250 à 499 salariés",
  "41": "500 à 999 salariés",
  "42": "1 000 à 1 999 salariés",
  "51": "2 000 à 4 999 salariés",
  "52": "5 000 à 9 999 salariés",
  "53": "10 000 salariés et plus",
};

export function formatTrancheEffectifsUniteLegale(
  code: string | null | undefined,
): string {
  if (!code) return "Non renseigné";
  return TRANCHE_EFFECTIFS_UNITE_LEGALE_LABELS[code] ?? "Non renseigné";
}
