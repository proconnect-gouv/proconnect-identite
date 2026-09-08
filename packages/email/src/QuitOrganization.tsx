//

import { Layout } from "./_layout.js";
import { Text } from "./components/index.js";

//

export default function QuitOrganization(props: Props) {
  const { given_name, family_name, organization_label } = props;
  return (
    <Layout>
      <Text safe>
        Bonjour {given_name} {family_name},
      </Text>
      <br />
      <Text safe>
        Vous avez quitté l'organisation {organization_label} sur ProConnect.
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
  organization_label: string;
};
