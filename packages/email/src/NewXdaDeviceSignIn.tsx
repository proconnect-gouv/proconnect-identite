//

import { escapeHtml } from "@kitajs/html";
import { Layout } from "./_layout.js";
import { Link, Text } from "./components/index.js";

//

export default function NewXdaDeviceSignIn(props: Props) {
  const { sp_name, support_link } = props;
  return (
    <Layout>
      <Text>
        Bonjour,
        <br />
        <br />
        Pour vous connecter à <b>{escapeHtml(sp_name)}</b> via ProConnect, vous
        venez de vérifier un nouvel appareil depuis votre ordinateur connecté au
        RIE (Réseau Interministériel de l’État).
        <br />
        <br />
        Si vous êtes à l’origine de cette vérification, vous n’avez rien à
        faire.
        <br />
        <br />
        Si vous n’êtes pas à l’origine de cette vérification, contactez notre
        support : <Link href={support_link}>{support_link}</Link>
      </Text>
    </Layout>
  );
}

//

export type Props = {
  sp_name: string;
  support_link: string;
};
