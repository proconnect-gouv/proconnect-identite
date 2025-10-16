import type { Organization } from "#src/types";

const codesNaf = [
  "35.11Z",
  "35.13Z",
  "36.00Z",
  "37.00Z",
  "38.11Z",
  "38.12Z",
  "42.99Z",
  "49.39A",
  "56.29B",
  "84.11Z",
  "84.12Z",
  "84.13Z",
  "85.20Z",
  "87.10A",
  "87.30A",
  "88.91A",
  "88.99B",
  "91.03Z",
  "93.29Z",
  "96.03Z",
];

export const isSyndicatCommunal = ({
  cached_activite_principale,
}: Pick<Organization, "cached_activite_principale">): boolean => {
  if (!cached_activite_principale) {
    return false;
  }
  return codesNaf.includes(cached_activite_principale.toUpperCase());
};
