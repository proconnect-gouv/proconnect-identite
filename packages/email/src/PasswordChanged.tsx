//

import { Layout } from "./_layout.js";
import { Text } from "./components/index.js";

//

export default function PasswordChanged(props: Props) {
  const { given_name, family_name } = props;
  return (
    <Layout>
      <Text safe>
        Bonjour {given_name} {family_name},
      </Text>
      <br />
      <Text>
        Le mot de passe de votre compte ProConnect vient d'être modifié.
        <br />
        Si vous n'êtes pas à l'origine de cette action, contactez-nous
        immédiatement.
      </Text>
    </Layout>
  );
}

//

export type Props = {
  given_name: string;
  family_name: string;
};
