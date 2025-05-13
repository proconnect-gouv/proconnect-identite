//

import { type FranceConnectUserInfoResponse } from "@gouvfr-lasuite/proconnect.identite/types";
import { type Citizen } from "../../data/people.js";

//

export default function SelectPage({ citizens }: SelectPageProps) {
  return `
  <html color-mode="user">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🇫🇷</text></svg>">
    <title>Connexion 🎭 FranceConnect 🎭</title>
    <header>
      <section>
        <h1>🎭 FranceConnect 🎭</h1>
      </section>
    </header>
    <main>
      <hr>
      <section>
        ${Array.from(citizens.values())
          .map((people) => ProfileForm(people))
          .join("")}
      </section>

      <hr>

      <header>
        <h2>Clique sur un des citoyens pour l'impersonifier</h2>
      </header>
    </main>
    <link rel="stylesheet" href="https://unpkg.com/mvp.css@1.17.2/mvp.css">
  </html>
  `;
}
function ProfileForm(props: {
  avataaars: string;
  user_info: FranceConnectUserInfoResponse;
}) {
  const { avataaars, user_info } = props;
  return `
  <form method="post">
    <header>
      <p><img src='${avataaars}'/></p>
      <p><button>Je suis ${user_info.given_name} ${user_info.family_name}</button></p>
    </header>
    <details>
      <summary><b>[${user_info.given_name} ${user_info.family_name}]</b></summary>
      <pre>${JSON.stringify(user_info, null, 2)}</pre>
    </details>
     ${Object.entries(user_info)
       .map(
         ([key, value]) =>
           `<label hidden for="${key}">${key}</label>` +
           `<input id="${key}" type="hidden" name="${key}" value="${value}"/>`,
       )
       .join("<br/>")}
  </form>
  `;
}

type SelectPageProps = {
  citizens: Citizen[];
};
