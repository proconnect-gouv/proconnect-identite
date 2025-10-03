//

import { Layout, type LayoutProps } from "./_layout";
import { Button, Em, Text } from "./components";

//

export default function ResetPassword(props: Props) {
  const { baseurl, reset_password_link } = props;
  return (
    <Layout baseurl={baseurl}>
      <Text safe>Bonjour,</Text>
      <br />
      <Text>
        Nous avons reçu une demande de réinitialisation de votre mot de passe.
        <br />
        <br />
        <Em>
          Si vous n’avez pas fait cette demande, vous pouvez ignorer cet email.
        </Em>
        <br />
        <br />
        Pour changer le mot de passe de votre compte ProConnect, cliquez sur le
        bouton ci-dessous :
      </Text>
      <br />
      <Button href={reset_password_link}>Réinitialiser le mot de passe</Button>
      <br />
      <Text>
        Votre mot de passe changera seulement si vous cliquez sur le lien et que
        vous en choisissez un nouveau.
      </Text>
    </Layout>
  );
}

//

export type Props = LayoutProps & {
  reset_password_link: string;
};
