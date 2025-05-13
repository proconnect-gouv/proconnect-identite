//

import { HOST } from "../../config/env";

//

export function unableToAutoJoinOrganizationMd() {
  return `
![ProConnect](${HOST}/dist/mail-proconnect.png)

Bonjour,

Nous vérifions votre lien à l’organisation, vous recevrez un email de confirmation dès que votre compte sera validé.
(délai moyen : 1 jour ouvré)

Cordialement,
L’équipe ProConnect
`.trim();
}
