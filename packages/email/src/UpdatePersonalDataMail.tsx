//

import { Layout, type LayoutProps } from "./_layout";
import { Text } from "./components";

export default function UpdatePersonalDataMail(props: Props) {
  const { baseurl, family_name, given_name, updatedFields } = props;
  return (
    <Layout baseurl={baseurl}>
      <Text safe>
        Bonjour {given_name} {family_name},
      </Text>
      <br />
      <Text>
        Nous vous informons que vos données personnelles ont été mises à jour
        avec succès.
        <br />
        <br />
        Les données modifiées sont les suivantes :
      </Text>
      <ul>
        {updatedFields.given_name && (
          <li>
            <Text safe>Prénom : {updatedFields.given_name.new}</Text>
          </li>
        )}
        {updatedFields.family_name && (
          <li>
            <Text safe>Nom de famille : {updatedFields.family_name.new}</Text>
          </li>
        )}
        {updatedFields.phone_number && (
          <li>
            <Text safe>
              Numéro de téléphone : {updatedFields.phone_number.new}
            </Text>
          </li>
        )}
        {updatedFields.job && (
          <li>
            <Text safe>
              Profession ou rôle au sein de votre organisation :{" "}
              {updatedFields.job.new}
            </Text>
          </li>
        )}
      </ul>
    </Layout>
  );
}

//

export type Props = LayoutProps & {
  family_name: string | null;
  given_name: string | null;
  updatedFields: Partial<{
    family_name: { new: string | null; old: string | null };
    given_name: { new: string | null; old: string | null };
    job: { new: string | null; old: string | null };
    phone_number: { new: string | null; old: string | null };
  }>;
};
