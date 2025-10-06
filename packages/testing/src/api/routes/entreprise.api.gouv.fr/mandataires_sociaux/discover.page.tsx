//

import type { InfogreffeSirenMandatairesSociaux } from "@proconnect-gouv/proconnect.entreprise/types";

//

export default function DiscoverPage(
  mandataires_siren: Array<{
    siren: string;
    mandataires: InfogreffeSirenMandatairesSociaux[];
  }>,
) {
  return `
  <html color-mode="user">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🇫🇷</text></svg>">
    <title>Mandataires sociaux 🎭 Discover 🎭 Entreprise API 🎭</title>
    <header>
      <section>
        <h1>🎭 Entreprise API 🎭</h1>
      </section>
    </header>
    <main>
      <h2>Liste des mandataires sociaux</h2>
      <ul>
      ${mandataires_siren
        .map(
          ({ mandataires, siren }) => `
          <li>
            ${Mandataire(siren, mandataires)}
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

function Mandataire(
  siren: string,
  mandataire: InfogreffeSirenMandatairesSociaux[],
) {
  return `
   <details>
    <summary><code>${siren}</code></summary>
    <pre>${JSON.stringify(mandataire, null, 2)}</pre>
  </details>
  `;
}
