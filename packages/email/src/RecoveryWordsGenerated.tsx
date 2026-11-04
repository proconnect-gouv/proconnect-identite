//

import { Layout } from "./_layout.js";
import { Link, Text } from "./components/index.js";

//

export default function RecoveryWordsGenerated(props: Props) {
  const { family_name, given_name, support_email, regenerated } = props;
  const mailtoParams = new URLSearchParams({
    subject: regenerated
      ? "Erreur - Regenerate Recovery Words"
      : "Erreur - Create Recovery Words",
  });
  const mailtoHref = `mailto:${support_email}?${mailtoParams.toString()}`;

  return (
    <Layout>
      <Text safe>
        Bonjour {given_name} {family_name},
      </Text>
      <br />
      <Text>
        {regenerated
          ? "Vos mots de secours ont été modifiés. Les anciens mots ne fonctionnent plus."
          : "Des mots de secours ont été créés pour votre compte. Ils vous permettront de le récupérer si vous perdez l'accès à votre double authentification."}
        <br />
        <br />
        <Link href={mailtoHref}>
          Si vous n'êtes pas à l'origine de cette action, quelqu'un utilise
          peut-être votre compte. Faites-le nous savoir en répondant à cet
          email.
        </Link>
      </Text>
    </Layout>
  );
}

//

export type Props = {
  family_name: string;
  given_name: string;
  support_email: string;
  regenerated: boolean;
};
