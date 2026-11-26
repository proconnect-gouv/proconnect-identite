//

import { Layout } from "./_layout.js";
import { Link, Text } from "./components/index.js";

//

export default function AccountRecovered(props: Props) {
  const { family_name, given_name, support_email } = props;
  const subject = encodeURIComponent(
    "Récupération non reconnue de mon compte ProConnect",
  );
  const body = encodeURIComponent(
    `Bonjour,\n\nJ'ai reçu une notification m'informant que mon compte ProConnect a été récupéré avec mes mots de secours.\n\nJe ne suis pas à l'origine de cette récupération. Je souhaite signaler une activité suspecte sur mon compte et vérifier qu'aucun accès non autorisé n'a eu lieu.\n\nCordialement,\n\n${given_name} ${family_name}`,
  );
  const mailtoHref = `mailto:${support_email}?subject=${subject}&body=${body}`;
  return (
    <Layout>
      <Text safe>
        Bonjour {given_name} {family_name},
      </Text>
      <br />
      <Text>
        <b>
          Vos mots de secours ont été utilisés pour récupérer l'accès à votre
          compte ProConnect.
        </b>
      </Text>
      <br />
      <Text>
        Pour protéger votre compte, votre connexion renforcée a été
        réinitialisée et vos anciens mots de secours ne sont plus utilisables.
      </Text>
      <br />
      <Text>
        <b>Que devez-vous faire maintenant ?</b>
      </Text>
      <br />
      <Text>
        Lors de votre prochaine connexion à ProConnect, vous devrez configurer à
        nouveau votre connexion renforcée et générer de nouveaux mots de
        secours.
        <br />
        <br />
        Pour en savoir plus, consultez notre guide :{" "}
        <Link href="https://proconnect.crisp.help/fr/article/comment-utiliser-et-conserver-mes-mots-de-secours-proconnect-fxz10e/">
          Comment utiliser et conserver mes mots de secours ProConnect ?
        </Link>
      </Text>
      <br />
      <Text>
        <b>Vous n'êtes pas à l'origine de cette opération ?</b>
      </Text>
      <br />
      <Text>
        Si vous n'avez pas utilisé vos mots de secours, une autre personne a
        peut-être accédé à votre compte.
      </Text>
      <br />
      <Text>
        Nous vous recommandons de{" "}
        <b>modifier immédiatement votre mot de passe</b> et de{" "}
        <Link href={mailtoHref}>
          contacter l'assistance ProConnect à cette adresse : {support_email}
        </Link>
        .
      </Text>
    </Layout>
  );
}

//

export type Props = {
  family_name: string;
  given_name: string;
  support_email: string;
};
