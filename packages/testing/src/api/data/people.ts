import type { InseeSiretEstablishment } from "@gouvfr-lasuite/proconnect.entreprise/types";
import type { FranceConnectUserInfoResponse } from "@gouvfr-lasuite/proconnect.identite/types";

export const PEOPLE = new Map<
  string,
  {
    readonly adresse: InseeSiretEstablishment["adresse"];
    readonly personne_physique_attributs: InseeSiretEstablishment["unite_legale"]["personne_physique_attributs"];
  }
>([
  [
    "94957325700019",
    {
      adresse: {
        acheminement_postal: {
          l1: "ROGAL DORN",
          l2: "PHALANX",
          l3: "7 IMPERIAL PALACE",
          l4: "IMPERIAL FISTS CHAPTER",
          l5: "00007 TERRA",
          l6: "TER07 SEGMENTUM SOLAR",
          l7: "IMPERIUM OF MAN",
        },
        code_cedex: "TER07",
        code_commune: "00007",
        code_pays_etranger: null,
        code_postal: "00007",
        complement_adresse: "PHALANX",
        distribution_speciale: "IMPERIAL FISTS CHAPTER",
        indice_repetition_voie: null,
        libelle_cedex: "SEGMENTUM SOLAR",
        libelle_commune_etranger: null,
        libelle_commune: "TERRA",
        libelle_pays_etranger: null,
        libelle_voie: "IMPERIAL PALACE",
        numero_voie: "7",
        status_diffusion: "partiellement_diffusible",
        type_voie: "PLACE",
      },
      personne_physique_attributs: {
        nom_naissance: "DORN",
        nom_usage: "DORN",
        prenom_1: "ROGAL",
        prenom_2: "AURELIUS",
        prenom_3: "IMPERIUS",
        prenom_4: null,
        prenom_usuel: "ROGAL",
        pseudonyme: "PRAETORIAN",
        sexe: "M",
      },
    },
  ],
]);

export interface Citizen {
  user_info: FranceConnectUserInfoResponse;
  avataaars: string;
}
export const FRANCECONNECT_CITIZENS = new Map<string, Citizen>([
  [
    "Jean De La Rose",
    {
      user_info: {
        birthdate: new Date("2001-01-01"),
        birthplace: "Internet",
        family_name: "De La Rose",
        gender: "male",
        given_name: "Jean",
        preferred_username: "Dulac",
        sub: "🎭 FranceConnect Sub",
      },
      avataaars: `https://avataaars.io/?${new URLSearchParams({
        avatarStyle: "Circle",
        topType: "LongHairCurly",
        accessoriesType: "Round",
        hairColor: "PastelPink",
        facialHairType: "BeardMedium",
        facialHairColor: "BrownDark",
        clotheType: "ShirtCrewNeck",
        clotheColor: "Pink",
        eyeType: "Surprised",
        eyebrowType: "SadConcernedNatural",
        mouthType: "Serious",
        skinColor: "Brown",
      })}`,
    },
  ],
  [
    "Marie Héricart",
    {
      user_info: {
        birthdate: new Date("2001-01-01"),
        birthplace: "75000",
        family_name: "Héricart",
        gender: "female",
        given_name: "Marie",
        preferred_username: "Heric",
        sub: "🎭 FranceConnect Sub",
      },
      avataaars: `https://avataaars.io/?${new URLSearchParams({
        avatarStyle: "Circle",
        topType: "Hijab",
        accessoriesType: "Kurt",
        hatColor: "Gray01",
        hairColor: "Brown",
        facialHairType: "BeardMajestic",
        facialHairColor: "Platinum",
        clotheType: "CollarSweater",
        clotheColor: "Gray01",
        eyeType: "Squint",
        eyebrowType: "Angry",
        mouthType: "Sad",
        skinColor: "Brown",
      })}`,
    },
  ],
  [
    "Rogal Dorn",
    {
      user_info: {
        birthdate: new Date("2001-01-01"),
        birthplace: "00007",
        family_name: "Dorn",
        gender: "male",
        given_name: "Rogal",
        preferred_username: "Prætor",
        sub: "🎭 FranceConnect Sub",
      },
      avataaars: `https://avataaars.io/?${new URLSearchParams({
        avatarStyle: "Circle",
        topType: "Hat",
        accessoriesType: "Round",
        facialHairType: "BeardMedium",
        facialHairColor: "Black",
        clotheType: "GraphicShirt",
        clotheColor: "Black",
        graphicType: "SkullOutline",
        eyeType: "Side",
        eyebrowType: "AngryNatural",
        mouthType: "Serious",
        skinColor: "Light",
      })}`,
    },
  ],
  [
    "Douglas Le Gris Duteil",
    {
      user_info: {
        birthdate: new Date("1980-06-01"),
        birthplace: "75000",
        family_name: "Duteil",
        gender: "male",
        given_name: "Douglas Le Gris",
        preferred_username: "Dulac",
        sub: "🎭 FranceConnect Sub",
      },
      avataaars: `https://avataaars.io/?${new URLSearchParams({
        avatarStyle: "Circle",
        topType: "ShortHairDreads01",
        accessoriesType: "Round",
        hatColor: "Blue02",
        hairColor: "BlondeGolden",
        facialHairType: "BeardLight",
        facialHairColor: "BrownDark",
        clotheType: "ShirtVNeck",
        clotheColor: "White",
        eyeType: "Squint",
        eyebrowType: "AngryNatural",
        mouthType: "Default",
        skinColor: "Black",
      })}`,
    },
  ],
]);
