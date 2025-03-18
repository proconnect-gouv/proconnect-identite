//

import {
  FranceConnectUserInfoResponseSchema,
  type FranceConnectUserInfoResponse,
} from "@gouvfr-lasuite/proconnect.identite/types";

//

export default function SelectPage(props: SelectPageProps) {
  const { codeValue, userinfo } = props;
  const avataaarsParams = new URLSearchParams({
    avatarStyle: "Circle",
    topType: "LongHairCurly",
    accessoriesType: "Round",
    hairColor: "PastelPink",
    facialHairType: "BeardMedium",
    facialHairColor: "BrownDark",
    clotheType: "ShirtCrewNeck",
    clotheColor: "Pink",
    eyeType: "Surprised",
    eyebrowType: "SadConcernedNatural",
    mouthType: "Serious",
    skinColor: "Brown",
  });
  const avatar = `https://avataaars.io/?${avataaarsParams}`;
  const profile = userinfo;
  return `
  <html color-mode="user">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🇫🇷</text></svg>">
    <link rel="stylesheet" href="https://unpkg.com/mvp.css"/>
    <script src="https://unpkg.com/hyperscript.org@0.9.14"></script>
    <header>
      <section>
        <h1>🎭 FranceConnect 🎭</h1>
      </section>
    </header>
    <main>
      <hr>
      <section>
        <header>
          <h2>Click on one of those fake civilians to impersonate them (soon)</p>
        </header>
        <form action="/interaction/${codeValue}/login" method="post">
          <img src='${avatar}'/>
          <h3>${profile.given_name} ${profile.family_name}</h3>
          <pre>${JSON.stringify(profile, null, 2)}</pre>
          <details>
            <summary>Edit</summary>
            ${Object.entries(
              FranceConnectUserInfoResponseSchema.omit({ sub: true }).shape,
            )
              .map(
                ([key]) =>
                  `<label for="${key}">${key}</label>` +
                  `<input id="${key}" type="text" name="${key}" value="${profile[key]}"/>`,
              )
              .join("<br/>")}
          </details>
          <button _="
            on input from <input[name$='_name']/>
              set my innerText to 'Je suis ' + #given_name.value + ' ' + #family_name.value
            end
          ">Je suis ${profile.given_name} ${profile.family_name}</button>
        </form>
      </section>

      <hr>
    </main>
  </html>
  `;
}

type SelectPageProps = {
  codeValue: string;
  userinfo: FranceConnectUserInfoResponse;
};
