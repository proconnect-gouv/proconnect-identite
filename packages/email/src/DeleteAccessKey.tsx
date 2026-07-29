//

import { Layout } from "./_layout.js";
import { Link, Text } from "./components/index.js";

//

export default function DeleteAccessKey(props: Props) {
  const { family_name, given_name, support_email } = props;
  const mailtoParams = new URLSearchParams({
    subject: "Erreur - Delete Access Key",
  });
  const mailtoHref = `mailto:${support_email}?${mailtoParams.toString()}`;
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
