//

import { Layout } from "./_layout.js";
import { Button, Text } from "./components/index.js";

//

export default function VerifiedDeviceLink(props: Props) {
  const { xda_link } = props;
  return (
    <Layout>
      <Text>
        Bonjour,
        <br />
        <br />
        Vous souhaitez vous connecter à ProConnect sur un nouvel appareil qui
        n’est pas connecté au RIE (Réseau Interministériel d’Etat).
        <br />
        <br />
        Pour vérifier le nouvel appareil, cliquez sur ce bouton sur votre
        ordinateur RIE :
        <br />
        <br />
      </Text>
      <Button href={`https://${xda_link}`}>Vérifier mon appareil</Button>
      <Text>
        <br />
        Vous pouvez aussi taper cette URL dans la barre d’adresse de votre
        navigateur habituel : {xda_link}
      </Text>
    </Layout>
  );
}

//

export type Props = {
  /** XDA address without the protocol, e.g. "proconnect.gouv.fr/xda" */
  xda_link: string;
};
