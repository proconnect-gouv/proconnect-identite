//

import { Layout, type LayoutProps } from "./_layout";
import { Link, Text } from "./components";

//

export default function DeleteAccount(props: Props) {
  const { baseurl, given_name, family_name, support_email } = props;
  const mailtoParams = new URLSearchParams({
    subject: "Erreur - Delete account",
  });
  const mailtoHref = `mailto:${support_email}?${mailtoParams.toString()}`;
  return (
    <Layout baseurl={baseurl}>
      <Text safe>
        Bonjour {given_name} {family_name},
      </Text>
      <br />
      <Text>
        Nous vous confirmons que votre demande de suppression de compte a bien
        été prise en compte. Toutes vos données personnelles associées à ce
        compte ont été supprimées de notre système.
        <br />
        <br />
        <Link href={mailtoHref}>
          Si vous avez des questions ou des préoccupations, n'hésitez pas à nous
          contacter.
        </Link>
        <br />
        <br />
        Merci d'avoir utilisé ProConnect.
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
