//

import { Layout } from "./_layout.js";
import { Badge, Em, Text } from "./components/index.js";

//

export default function OtpEmail(props: Props) {
  const { token, validityDuration } = props;
  return (
    <Layout>
      <Text>Bonjour,</Text>
      <br />
      <Text>
        Voici votre code de connexion à usage unique.
        <br />
        Merci de copier-coller ou de renseigner ce code dans l’interface de
        connexion ProConnect.
        <br />
        <Em>Ce code est valable {validityDuration}.</Em>
      </Text>
      <br />
      <br />
      <Badge aria-label="Code de connexion à usage unique">
        <Em style={{ letterSpacing: "0.2em" }}>{token}</Em>
      </Badge>
      <br />
      <br />
    </Layout>
  );
}

//

export type Props = { token: string; validityDuration: string };
