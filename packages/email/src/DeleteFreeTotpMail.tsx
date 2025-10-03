//

import { Layout, type LayoutProps } from "./_layout";
import { Link, Text } from "./components";

//

export default function DeleteFreeTotpMail(props: Props) {
  const { baseurl, given_name, family_name, support_email } = props;
  const mailtoParams = new URLSearchParams({
    subject: "Erreur - Mon organisation",
  });
  const mailtoHref = `mailto:${support_email}?${mailtoParams.toString()}`;
  return (
    <Layout baseurl={baseurl}>
      <Text safe>
        Bonjour {given_name} {family_name},
      </Text>
      <br />
      <Text>
        L'application a été supprimée comme étape de connexion à deux facteurs.
        <br />
        <br />
        <Link href={mailtoHref}>
          Si vous n'avez pas supprimé cette application, quelqu'un utilise
          peut-être votre compte. Faites-le nous savoir en répondant à cet
          email.
        </Link>
      </Text>
    </Layout>
  );
}

//

export type Props = LayoutProps & {
  given_name: string;
  family_name: string;
  support_email: string;
};
