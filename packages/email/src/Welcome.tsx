//

import { Layout, type LayoutProps } from "./_layout";
import { Em, Link, Text } from "./components";

//

export default function Welcome(props: Props) {
  const { baseurl, family_name, given_name } = props;
  return (
    <Layout baseurl={baseurl}>
      <Text safe>
        Bonjour {given_name} {family_name},
      </Text>
      <br />
      <Text>
        <Em>Votre compte ProConnect est créé !</Em>
        <br />
        <br />
        Vous pouvez à présent retourner sur votre démarche ou demande.
        <br />
        <br />À tout moment, retrouvez les informations de votre compte
        ProConnect sur{" "}
        <Link href={baseurl} target="_blank">
          {baseurl}
        </Link>
        .
      </Text>
    </Layout>
  );
}

//

export type Props = LayoutProps & {
  family_name: string;
  given_name: string;
};
