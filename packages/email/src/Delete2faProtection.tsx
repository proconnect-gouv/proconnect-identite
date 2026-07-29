//

import { Layout } from "./_layout.js";
import { Text } from "./components/index.js";

//

export default function Delete2faProtection(props: Props) {
  const { given_name, family_name } = props;
  return (
    <Layout>
      <Text safe>
        Bonjour {given_name} {family_name},
      </Text>
      <br />
      <Text>
        Votre compte ProConnect n'est plus protégé par la validation en deux
        étapes.
        <br />
        Vous n'avez pas besoin de votre deuxième facteur pour vous connecter.
      </Text>
    </Layout>
  );
}

//

export type Props = {
  given_name: string;
  family_name: string;
};
