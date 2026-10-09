//

import { Layout } from "./_layout.js";
import { NoWrap, Text } from "./components/index.js";

//

export default function CancelModeration(props: Props) {
  const { given_name, family_name, libelle } = props;
  return (
    <Layout>
      <Text safe>
        Bonjour {given_name} {family_name},
      </Text>
      <br />
      <Text>
        Nous vous confirmons que votre demande de rattachement à l'organisation{" "}
        <NoWrap>
          « <b safe>{libelle}</b> »
        </NoWrap>{" "}
        a bien été annulée.
        <br />
        <br />
        Si vous n'êtes pas à l'origine de cette annulation, ou si vous souhaitez
        de nouveau rejoindre cette organisation, vous pouvez renouveler votre
        demande depuis votre espace ProConnect.
      </Text>
    </Layout>
  );
}

//

export type Props = {
  given_name: string;
  family_name: string;
  libelle: string;
};
