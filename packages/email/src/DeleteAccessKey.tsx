//

import { Layout } from "./_layout.js";
import { Link, Text } from "./components/index.js";

//

export default function DeleteAccessKey(props: Props) {
  const { family_name, given_name, support_email } = props;
  const subject = encodeURIComponent(
    "Suppression non reconnue d'une clé d'accès sur mon compte ProConnect",
  );
  const body = encodeURIComponent(
    `Bonjour,\n\nJ'ai reçu une notification m'informant qu'une clé d'accès a été supprimée de mon compte ProConnect.\n\nJe ne suis pas à l'origine de cette suppression. Je souhaite signaler une activité suspecte sur mon compte et vérifier qu'aucun accès non autorisé n'a eu lieu.\n\nCordialement,\n\n${given_name} ${family_name}`,
  );
  const mailtoHref = `mailto:${support_email}?subject=${subject}&body=${body}`;
  return (
    <Layout>
      <Text safe>
        Bonjour {given_name} {family_name},
      </Text>
      <br />
      <Text>
        Une clé d'accès a été supprimée de votre compte.
        <br />
        <br />
        <Link href={mailtoHref}>
          Si vous n'avez pas supprimé de clé d'accès, quelqu'un utilise
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
};
