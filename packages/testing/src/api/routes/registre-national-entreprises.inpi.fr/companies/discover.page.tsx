//

import type {
  CompaniesSirenResponse,
  Pouvoir,
} from "@proconnect-gouv/proconnect.registre_national_entreprises/types";

//

export default function DiscoverPage(
  companies_siren: Array<{
    siren: string;
    company: CompaniesSirenResponse;
  }>,
) {
  return `
  <html color-mode="user">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🇫🇷</text></svg>">
    <title>RNE Companies 🎭 Discover 🎭 Registre National des Entreprises 🎭</title>
    <header>
      <section>
        <h1>🎭 Registre National des Entreprises 🎭</h1>
      </section>
    </header>
    <main>
      <h2>Liste des entreprises (Companies)</h2>
      <ul>
      ${companies_siren
        .map(
          ({ company, siren }) => `
          <li>
            ${Company(siren, company)}
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

function Company(siren: string, company: CompaniesSirenResponse) {
  const pouvoirs =
    company.formality?.content?.personneMorale?.composition?.pouvoirs || [];

  return `
   <details>
    <summary>
      <code>${siren}</code>
      ${pouvoirs.length > 0 ? `(${pouvoirs.length} pouvoir${pouvoirs.length > 1 ? "s" : ""})` : "(no pouvoirs)"}
    </summary>
    ${
      pouvoirs.length > 0
        ? `
      <h3>Pouvoirs:</h3>
      <ul>
        ${pouvoirs.map((pouvoir) => `<li>${PouvoirItem(pouvoir)}</li>`).join("")}
      </ul>
    `
        : ""
    }
    <h3>Full Company Data:</h3>
    <pre>${JSON.stringify(company, null, 2)}</pre>
  </details>
  `;
}

function PouvoirItem(pouvoir: Pouvoir) {
  const actif = pouvoir.actif ? "✅ Actif" : "❌ Inactif";
  const type = pouvoir.typeDePersonne || "Unknown";
  const person = pouvoir.individu?.descriptionPersonne;
  const name =
    `${person?.prenoms?.join(" ") || ""} ${person?.nom || ""}`.trim();

  return `
    <details>
      <summary>${actif} - ${type} - <strong>${name}</strong></summary>
      <pre>${JSON.stringify(person, null, 2)}</pre>
    </details>
  `;
}
