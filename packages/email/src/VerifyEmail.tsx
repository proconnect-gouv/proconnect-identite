//

import { Layout, type LayoutProps } from "./_layout";
import { Badge, Em, Text } from "./components";

//

export default function VerifyEmail(props: Props) {
  const { baseurl, token } = props;
  return (
    <Layout baseurl={baseurl}>
      <Text>Bonjour,</Text>
      <br />
      <Text>
        Pour vérifier votre adresse e-mail, merci de de copier-coller ou de
        renseigner ce code dans l’interface de connexion ProConnect.
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

export type Props = LayoutProps & { token: string };
