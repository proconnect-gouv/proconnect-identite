//

import { Layout } from "./_layout.js";
import { Link, Text } from "./components/index.js";

//

export default function RecoveryWordsGenerated(props: Props) {
  const { family_name, given_name, support_email, regenerated } = props;
  const subject = encodeURIComponent(
    regenerated
      ? "Erreur - Régénration des mots de secours"
      : "Erreur - Création des mots de secours",
  );
  const mailtoHref = `mailto:${support_email}?subject=${subject}`;

  return (
    <Layout>
      <Text safe>
        Bonjour {given_name} {family_name},
      </Text>
      <br />
      <Text>
        Vos mots de secours ont été {regenerated ? "modifiés" : "créés"} sur
        votre compte ProConnect Identité.
      </Text>
      <br />
      <Text>
        <b>À quoi servent vos mots de secours ?</b>
      </Text>
      <br />
      <Text>
        Ils vous permettent de récupérer l'accès à votre compte si vous perdez
        votre moyen de connexion renforcée.
      </Text>
      <br />
      <Text>
        Conservez-les dans un endroit sécurisé et ne les communiquez à personne,
        y compris au support ProConnect.
      </Text>
      <br />
      <Text>
        <b>Que pouvez-vous faire depuis votre compte ProConnect Identité ?</b>
      </Text>
      <br />
      <Text>
        Depuis{" "}
        <Link href="https://identite.proconnect.gouv.fr/connection-and-account">
          la gestion de votre compte
        </Link>
        , vous pouvez notamment :
      </Text>
      <ul>
        <li>
          <Text>Consulter et gérer vos méthodes de connexion renforcée.</Text>
        </li>
        <li>
          <Text>
            Ajouter une méthode de validation supplémentaire, sans supprimer
            celle déjà configurée.
          </Text>
        </li>
        <li>
          <Text>Gérer vos mots de secours.</Text>
        </li>
      </ul>
      <Text>
        <b>Besoin d'aide ?</b>
      </Text>
      <br />
      <Text>
        Consultez notre{" "}
        <Link href="https://proconnect.crisp.help/fr/article/comment-utiliser-et-conserver-mes-mots-de-secours-proconnect-fxz10e/">
          FAQ ProConnect
        </Link>{" "}
        pour retrouver les conseils d'utilisation et de sécurisation de votre
        compte.
      </Text>
      <br />
      <Text>
        <b>Vous n'êtes pas à l'origine de cette action ?</b>
      </Text>
      <br />
      <Text>
        Si vous n'avez pas créé ou modifié vos mots de secours, une autre
        personne pourrait avoir accédé à votre compte.
      </Text>
      <br />
      <Text>
        <Link href={mailtoHref}>
          Contactez immédiatement le support ProConnect en répondant à cette
          adresse email : {support_email}.
        </Link>
      </Text>
    </Layout>
  );
}

//

export type Props = {
  family_name: string;
  given_name: string;
  support_email: string;
  regenerated: boolean;
};
