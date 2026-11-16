//

import { Layout } from "./_layout.js";
import { Link, Text } from "./components/index.js";

//

export default function RecoveryWordsGenerated(props: Props) {
  const { family_name, given_name, support_email, regenerated } = props;
  const subject = encodeURIComponent(
    regenerated
      ? "Erreur - Régénration des mots de secours"
      : "Erreur - Création des mots de secours",
  );
  const mailtoHref = `mailto:${support_email}?subject=${subject}`;

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
