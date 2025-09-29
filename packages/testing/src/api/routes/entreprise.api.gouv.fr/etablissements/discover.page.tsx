//

import { formatNomComplet } from "@gouvfr-lasuite/proconnect.entreprise/formatters";
import type { InseeSireneEstablishmentSiretResponseData } from "@gouvfr-lasuite/proconnect.entreprise/types";
//

export default function DiscoverPage(
  establishment_siret_pair: Array<{
    establishment: InseeSireneEstablishmentSiretResponseData;
    siren: string;
  }>,
) {
  return `
  <html color-mode="user">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🇫🇷</text></svg>">
    <title>Establissments 🎭 Discover 🎭 Entreprise API 🎭</title>
    <header>
      <section>
        <h1>🎭 Entreprise API 🎭</h1>
      </section>
    </header>
    <main>
      <h2>Liste des établissements</h2>
      <ul>
      ${establishment_siret_pair
        .map(
          ({ establishment, siren }) => `
          <li>
            ${Establissment(siren, establishment)}
          </li>
          `,
        )
        .join("")}
      </ul>
    </main>
    <link rel="stylesheet" href="https://unpkg.com/mvp.css@1.17.2/mvp.css">
  </html>
  `;
}

function Establissment(
  siren: string,
  establishment: InseeSireneEstablishmentSiretResponseData,
) {
  const libelle = formatNomComplet({
    denominationUniteLegale:
      establishment.unite_legale.personne_morale_attributs.raison_sociale ?? "",
    nomUniteLegale:
      establishment.unite_legale.personne_physique_attributs.nom_naissance,
    nomUsageUniteLegale:
      establishment.unite_legale.personne_physique_attributs.nom_usage,
    prenomUsuelUniteLegale:
      establishment.unite_legale.personne_physique_attributs.prenom_usuel,
    sigleUniteLegale:
      establishment.unite_legale.personne_morale_attributs.sigle,
  });
  return `
   <details>
    <summary><em>${libelle} (<code>${siren}</code>)</em></summary>
    <pre>${JSON.stringify(establishment, null, 2)}</pre>
  </details>
  `;
}
