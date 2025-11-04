//

import { Layout, type LayoutProps } from "./_layout";
import { Text } from "./components";

//

export default function ModerationProcessed(props: Props) {
  const { baseurl, libelle, email } = props;
  return (
    <Layout baseurl={baseurl}>
      <Text>Bonjour,</Text>
      <Text safe>
        Le rattachement de votre compte ProConnect ({email}) à l'organisation «{" "}
        {libelle} » a été validée sur {baseurl}.
      </Text>
      <Text>
        Vous pouvez à présent vous connecter sur le service en ligne souhaité.
        <br />
        <br />
        Nous restons à votre disposition pour toute information complémentaire.
        <br />
        <br />
      </Text>
    </Layout>
  );
}

//

export type Props = LayoutProps & {
  libelle: string;
  email: string;
};
