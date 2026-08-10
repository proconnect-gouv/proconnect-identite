//

import { HOST } from "../../config/env";

//

export function unableToAutoJoinOrganizationMd({
  siret,
  cached_libelle,
}: {
  siret: string;
  cached_libelle: string | null;
}): string {
  return `
![ProConnect](${HOST}/dist/mail-proconnect.png)

Bonjour,

Nous vérifions votre lien à l’organisation ${cached_libelle ? `${cached_libelle} (${siret})` : `(${siret})`}, vous recevrez un email de confirmation dès que votre compte sera validé.
(délai moyen : 1 jour ouvré)

Cordialement,
L’équipe ProConnect
`.trim();
}
