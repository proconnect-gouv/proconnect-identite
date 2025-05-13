//

import { Layout, type LayoutProps } from "./_layout";
import { Text } from "./components";

//

export default function Add2fa(props: Props) {
  const { baseurl, email, family_name, given_name } = props;
  return (
    <Layout baseurl={baseurl}>
      <Text safe>
        Bonjour {given_name} {family_name},
      </Text>
      <br />
      <Text>
        Votre compte ProConnect {email} est à présent protégé par la double
        authentification. Lorsque vous vous connectez sur un nouvel appareil ou
        sur un appareil qui n'est pas fiable, vous devez utiliser votre deuxième
        facteur pour confirmer votre identité.
      </Text>
    </Layout>
  );
}

//

export type Props = LayoutProps & {
  email: string;
  family_name: string;
  given_name: string;
};
