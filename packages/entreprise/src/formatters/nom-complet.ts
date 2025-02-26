//

import { capitalize } from "lodash-es";

//

type FormatNomCompletArgs = {
  denominationUniteLegale: string;
  prenomUsuelUniteLegale: string | null;
  nomUniteLegale: string | null;
  nomUsageUniteLegale: string | null;
  sigleUniteLegale: string | null;
};

export const formatNomComplet = ({
  denominationUniteLegale,
  prenomUsuelUniteLegale,
  nomUniteLegale,
  nomUsageUniteLegale,
  sigleUniteLegale,
}: FormatNomCompletArgs) => {
  const formattedFirstName = formatFirstNames([prenomUsuelUniteLegale ?? ""]);
  const formattedName = formatNameFull(
    nomUniteLegale ?? "",
    nomUsageUniteLegale ?? "",
  );
  return `${
    capitalize(denominationUniteLegale) ||
    [formattedFirstName, formattedName].filter((e) => !!e).join(" ") ||
    "Nom inconnu"
  }${sigleUniteLegale ? ` (${sigleUniteLegale})` : ""}`;
};

const formatFirstNames = (firstNames: string[], nameCount = 0) => {
  const formatted = firstNames.map(capitalize).filter((name) => !!name);
  if (nameCount > 0 && nameCount < firstNames.length) {
    return formatted.slice(0, nameCount).join(", ");
  }
  return formatted.join(", ");
};

const formatNameFull = (nomPatronymique = "", nomUsage = "") => {
  if (nomUsage && nomPatronymique) {
    return `${capitalize(nomUsage)} (${capitalize(nomPatronymique)})`;
  }
  return capitalize(nomUsage || nomPatronymique || "");
};
