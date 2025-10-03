//

import { Layout, type LayoutProps } from "./_layout";
import { Link, Text } from "./components";

//

export default function AddAccessKey(props: Props) {
  const { baseurl, family_name, given_name, support_email } = props;
  const mailtoParams = new URLSearchParams({
    subject: "Erreur - Add Access Key",
  });
  const mailtoHref = `mailto:${support_email}?${mailtoParams.toString()}`;

  return (
    <Layout baseurl={baseurl}>
      <Text safe>
        Bonjour {given_name} {family_name},
      </Text>
      <br />
      <Text>
        Une nouvelle clé d'accès a été ajoutée à votre compte.
        <br />
        <br />
        <Link href={mailtoHref}>
          Si vous n'avez pas ajouté de clé d'accès, quelqu'un utilise peut-être
          votre compte. Faites-le nous savoir en répondant à cet email.
        </Link>
      </Text>
    </Layout>
  );
}

//

export type Props = LayoutProps & {
  family_name: string;
  given_name: string;
  support_email: string;
};
