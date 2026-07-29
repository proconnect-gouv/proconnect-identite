//

import { Layout } from "./_layout.js";
import { Em, Link, Text } from "./components/index.js";

//

export default function Welcome(props: Props) {
  const { base_url, family_name, given_name } = props;
  return (
    <Layout>
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
        <Link href={base_url} target="_blank">
          {base_url}
        </Link>
        .
      </Text>
    </Layout>
  );
}

//

export type Props = {
  base_url: string;
  family_name: string;
  given_name: string;
};
