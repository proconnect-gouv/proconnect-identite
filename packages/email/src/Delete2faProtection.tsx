//

import { Layout, type LayoutProps } from "./_layout";
import { Text } from "./components";

//

export default function Delete2faProtection(props: Props) {
  const { baseurl, given_name, family_name } = props;
  return (
    <Layout baseurl={baseurl}>
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

export type Props = LayoutProps & {
  given_name: string;
  family_name: string;
};
