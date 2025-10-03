//

import { Layout, type LayoutProps } from "./_layout";
import { Badge, Em, Text } from "./components";

//

export default function OfficialContactEmailVerification(props: Props) {
  const { baseurl, given_name, email, family_name, libelle, token } = props;

  return (
    <Layout baseurl={baseurl}>
      <Text>Bonjour,</Text>
      <br />
      <Text>
        <b>
          {given_name} {family_name} ({email})
        </b>{" "}
        souhaite rejoindre votre organisation « <b>{libelle}</b> » sur
        ProConnect. Pour authentifier cette adresse email, copiez-collez ce code
        dans l’interface de connexion ProConnect
        <br />
        <Em>Ce code est valable 1h.</Em>
      </Text>
      <br />
      <br />
      <Badge aria-label="Code de vérification">
        <Em style={{ letterSpacing: "0.2em" }}>{token}</Em>
      </Badge>
      <br />
      <br />
    </Layout>
  );
}

//

export type Props = LayoutProps & {
  email: string;
  family_name: string;
  given_name: string;
  libelle: string;
  token: string;
};
