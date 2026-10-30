//

import { Layout } from "./_layout.js";
import { Link, Text } from "./components/index.js";

//

export default function AccountRecovered(props: Props) {
  const { family_name, given_name, support_email } = props;
  const subject = encodeURIComponent(
    "Récupération non reconnue de mon compte ProConnect",
  );
  const body = encodeURIComponent(
    `Bonjour,\n\nJ'ai reçu une notification m'informant que mon compte ProConnect a été récupéré avec mes mots de secours.\n\nJe ne suis pas à l'origine de cette récupération. Je souhaite signaler une activité suspecte sur mon compte et vérifier qu'aucun accès non autorisé n'a eu lieu.\n\nCordialement,\n\n${given_name} ${family_name}`,
  );
  const mailtoHref = `mailto:${support_email}?subject=${subject}&body=${body}`;
  return (
    <Layout>
      <Text safe>
        Bonjour {given_name} {family_name},
      </Text>
      <br />
      <Text>
        Vos mots de secours viennent d'être utilisés pour vous connecter à votre
        compte.
        <br />
        <br />
        Par sécurité, votre connexion renforcée a été réinitialisée et vos mots
        de secours ont été invalidés. Pensez à reconfigurer votre connexion
        renforcée et à générer de nouveaux mots de secours.
        <br />
        <br />
        <Link href={mailtoHref}>
          Si vous n'avez pas utilisé vos mots de secours, quelqu'un utilise
          peut-être votre compte. Changez votre mot de passe dès maintenant et
          faites-le nous savoir en répondant à cet email.
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
};
