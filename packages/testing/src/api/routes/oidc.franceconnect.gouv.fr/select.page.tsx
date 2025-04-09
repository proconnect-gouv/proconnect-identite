//

import { type FranceConnectUserInfoResponse } from "@gouvfr-lasuite/proconnect.identite/types";
import { FRANCECONNECT_PEOPLE } from "../../data/people.js";

//

export default function SelectPage(props: SelectPageProps) {
  const { userinfo } = props;

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
        <header>
          <h2>Click on one of those fake civilians to impersonate them</p>
        </header>
        ${Array.from(FRANCECONNECT_PEOPLE.values())
          .map(
            ({ avataaars, user_info }) => `

          <form method="post">
            <img src='${avataaars}'/>
            <h3>${user_info.given_name} ${user_info.family_name}</h3>
            <pre>${JSON.stringify(user_info, null, 2)}</pre>
            <details>
              <summary>Edit</summary>
              ${Object.entries(user_info)
                .map(
                  ([key, value]) =>
                    `<label for="${key}">${key}</label>` +
                    `<input id="${key}" type="text" name="${key}" value="${value}"/>`,
                )
                .join("<br/>")}
            </details>
            <button _="
              on input from <input[name$='_name']/>
                set my innerText to 'Je suis ' + #given_name.value + ' ' + #family_name.value
              end
            ">Je suis ${user_info.given_name} ${user_info.family_name}</button>
          </form>`,
          )
          .join("")}
      </section>

      <hr>
    </main>
    <link rel="stylesheet" href="https://unpkg.com/mvp.css@1.17.2/mvp.css">
    <script src="https://unpkg.com/hyperscript.org@0.9.14/dist/_hyperscript.min.js"></script>
  </html>
  `;
}

type SelectPageProps = {
  userinfo: FranceConnectUserInfoResponse;
};
