//

import { Layout, type LayoutProps } from "./_layout";
import { Button, Em, Text } from "./components";

//

export default function MagicLink(props: Props) {
  const { baseurl, magic_link } = props;
  return (
    <Layout baseurl={baseurl}>
      <Text>Bonjour,</Text>
      <br />
      <Text>
        Vous avez demandé un <b>lien d'identification</b> à ProConnect. Utilisez
        le bouton ci-dessous pour vous connecter instantanément.
        <br />
        <Em>Il est valable 1 heure</Em>.
      </Text>
      <br />
      <Button href={magic_link}>Se connecter</Button>
      <br />
      <Text>Ce lien a été généré pour vous. Merci de ne pas le partager.</Text>
    </Layout>
  );
}

//

export type Props = LayoutProps & {
  magic_link: string;
};
