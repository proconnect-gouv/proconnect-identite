//

export default function SelectPage(props: SelectPageProps) {
  const { codeValue, redirect_uri, state } = props;
  return `
  <html color-mode="user">
    <link rel="stylesheet" href="https://unpkg.com/mvp.css"/>
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
        ${ProfileForm({
          avatar:
            "https://avataaars.io/?avatarStyle=Circle&topType=LongHairCurly&accessoriesType=Round&hairColor=PastelPink&facialHairType=BeardMedium&facialHairColor=BrownDark&clotheType=ShirtCrewNeck&clotheColor=Pink&eyeType=Surprised&eyebrowType=SadConcernedNatural&mouthType=Serious&skinColor=Brown",
          codeValue,
          profile: { given_name: "Jean", family_name: "De La Rose" },
          redirect_uri,
          state,
        })}
        ${ProfileForm({
          avatar:
            "https://avataaars.io/?avatarStyle=Circle&topType=LongHairNotTooLong&accessoriesType=Sunglasses&hairColor=Blonde&facialHairType=Blank&facialHairColor=BlondeGolden&clotheType=BlazerShirt&clotheColor=Blue01&eyeType=Surprised&eyebrowType=SadConcerned&mouthType=Concerned&skinColor=Light",
          codeValue,
          profile: { given_name: "Marie", family_name: "Costaud" },
          redirect_uri,
          state,
        })}
      </section>

      <hr>
    </main>
  </html>
  `;
}
type SelectPageProps = {
  codeValue: string;
  redirect_uri: string;
  state: string;
};

//

function ProfileForm(props: ProfileFormProps) {
  const { avatar, codeValue, profile, redirect_uri, state } = props;
  return `
  <form action="${redirect_uri}" method="get">
    <input type="hidden" name="code" value="${codeValue}"/>
    <input type="hidden" name="iss" value="http://localhost:8600/api/v2"/>
    <input type="hidden" name="state" value="${state}"/>

    <img src='${avatar}'/>
    <h3>${profile.given_name} ${profile.family_name}</h3>
    <pre>${JSON.stringify(profile, null, 2)}</pre>
    <button>Je suis ${profile.given_name} ${profile.family_name}</button>
  </form>
  `;
}
type ProfileFormProps = {
  avatar: string;
  codeValue: string;
  profile: { given_name: string; family_name: string };
  redirect_uri: string;
  state: string;
};
