import { isEmailValid } from "@proconnect-gouv/proconnect.core/security";
import axios, { AxiosError, type AxiosResponse } from "axios";
import { isEmpty, isString } from "lodash-es";
import { AssertionError } from "node:assert";
import {
  FEATURE_USE_ANNUAIRE_EMAILS,
  HTTP_CLIENT_TIMEOUT,
  TEST_CONTACT_EMAIL,
} from "../config/env";
import {
  ApiAnnuaireConnectionError,
  ApiAnnuaireInvalidEmailError,
  ApiAnnuaireNotFoundError,
} from "../config/errors";
import { logger } from "../services/log";

type ApiAnnuaireEducationNationaleReponse = {
  total_count: number;
  links: {
    rel: "self" | "first" | "last";
    // ex: "https://data.education.gouv.fr/api/v2/catalog/datasets/fr-en-annuaire-education/records?where=siren_siret%3D19750663700010&limit=10&offset=0&include_app_metas=False&include_links=False"
    href: string;
  }[];
  records: {
    links: {
      rel: "self" | "datasets" | "dataset";
      // ex: "https://data.education.gouv.fr/api/v2/catalog/datasets"
      href: string;
    }[];
    record: {
      // ex: '886c9de6d33b66f33ead6ce93deb7a0eac0c3995'
      id: string;
      // ex: '2023-10-04T12:45:00Z'
      timestamp: string;
      // ex: 758
      size: number;
      fields: {
        // ex: '0750663N'
        identifiant_de_l_etablissement: string;
        // ex: 'Lycée Chaptal'
        nom_etablissement: string;
        // ex: 'Lycée'
        type_etablissement: string;
        // ex: 'Public'
        statut_public_prive: string;
        // ex: '45 boulevard des Batignolles'
        adresse_1: string;
        // ex: null
        adresse_2: string | null;
        // ex: null
        adresse_3: string | null;
        // ex: '75008'
        code_postal: string;
        // ex: '75100'
        code_commune: string;
        // ex: 'Paris'
        nom_commune: string;
        // ex: '075'
        code_departement: string;
        // ex: '01'
        code_academie: string;
        // ex: '11'
        code_region: string;
        // ex: null
        ecole_maternelle: string | null;
        // ex: null
        ecole_elementaire: string | null;
        // ex: '1'
        voie_generale: "1" | "0";
        // ex: '1'
        voie_technologique: "1" | "0";
        // ex: '0'
        voie_professionnelle: "1" | "0";
        // ex: '01 45 22 76 95'
        telephone: string;
        // ex: '01 45 22 85 12'
        fax: string;
        // ex: 'https://lycee-chaptal.ac-paris.fr'
        web: string;
        // ex: 'ce.0750663n@ac-paris.fr'
        mail: string;
        // ex: 1
        restauration: number;
        // ex: 1
        hebergement: number;
        // ex: 0
        ulis: number;
        // ex: '0'
        apprentissage: "1" | "0";
        // ex: '0'
        segpa: "1" | "0";
        // ex: '0'
        section_arts: "1" | "0";
        // ex: '0'
        section_cinema: "1" | "0";
        // ex: '0'
        section_theatre: "1" | "0";
        // ex: '0'
        section_sport: "1" | "0";
        // ex: '0'
        section_internationale: "1" | "0";
        // ex: '1'
        section_europeenne: "1" | "0";
        // ex: '0'
        lycee_agricole: "1" | "0";
        // ex: '0'
        lycee_militaire: "1" | "0";
        // ex: '0'
        lycee_des_metiers: "1" | "0";
        // ex: '1'
        post_bac: "1" | "0";
        // ex: null
        appartenance_education_prioritaire: null;
        // ex: '1'
        greta: "1" | "0";
        // ex: '19750663700010'
        siren_siret: string;
        // ex: 564
        nombre_d_eleves: number;
        // ex: 'https://www.onisep.fr/http/redirection/etablissement/slug/ENS.1865'
        fiche_onisep: string;
        position: {
          lon: number;
          lat: number;
        };
        // ex: 'SANS OBJET'
        type_contrat_prive: string;
        // ex: 'Paris'
        libelle_departement: string;
        // ex: 'Paris'
        libelle_academie: string;
        // ex: 'Ile-de-France'
        libelle_region: string;
        // ex: 650107.7
        coordx_origine: number;
        // ex: 6864850.5
        coordy_origine: number;
        // ex: 'EPSG:2154'
        epsg_origine: string;
        // ex: null
        nom_circonscription: null;
        // ex: 48.881738320109136
        latitude: number;
        // ex: 2.3196885071009623
        longitude: number;
        // ex: 'Numéro de rue'
        precision_localisation: string;
        // ex: '1965-05-01'
        date_ouverture: string;
        // ex: '2023-10-04'
        date_maj_ligne: string;
        // ex: 'OUVERT'
        etat: string;
        // ex: "MINISTERE DE L'EDUCATION NATIONALE"
        ministere_tutelle: string;
        // ex: 0
        multi_uai: number;
        // ex: 0
        rpi_concentre: number;
        // ex: null
        rpi_disperse: null;
        // ex: 300
        code_nature: number;
        // ex: 'LYCEE ENSEIGNT GENERAL ET TECHNOLOGIQUE'
        libelle_nature: string;
        // ex: '99'
        code_type_contrat_prive: string;
        // ex: '0752529S'
        pial: string;
        // ex: null
        etablissement_mere: null;
        // ex: null
        type_rattachement_etablissement_mere: null;
        // ex: '01000'
        code_zone_animation_pedagogique: string;
        // ex: 'BASSIN PARIS'
        libelle_zone_animation_pedagogique: string;
      };
    };
  }[];
};

export const getAnnuaireEducationNationaleContactEmail = async (
  siret: string | null,
): Promise<string> => {
  if (isEmpty(siret)) {
    throw new ApiAnnuaireNotFoundError("siret is empty", {
      cause: new AssertionError({
        actual: siret,
        expected: "non-empty siret",
        message: "siret parameter must not be empty",
        operator: "isEmpty",
      }),
    });
  }

  let records: ApiAnnuaireEducationNationaleReponse["records"] = [];
  try {
    const { data }: AxiosResponse<ApiAnnuaireEducationNationaleReponse> =
      await axios({
        method: "GET",
        url: `https://data.education.gouv.fr/api/v2/catalog/datasets/fr-en-annuaire-education/records?where=siren_siret%3D${siret}`,
        headers: {
          accept: "application/json",
        },
        timeout: HTTP_CLIENT_TIMEOUT,
      });

    records = data.records;
  } catch (e) {
    if (
      e instanceof AxiosError &&
      (e.code === "ECONNABORTED" ||
        e.code === "ERR_BAD_RESPONSE" ||
        e.code === "EAI_AGAIN")
    ) {
      throw new ApiAnnuaireConnectionError(e.code, { cause: e });
    }

    throw e;
  }

  let record: ApiAnnuaireEducationNationaleReponse["records"][0] | undefined;

  // We take the first établissement as every établissements are sharing the same SIRET.
  // We assume the first contact email is OK for every other établissements.
  record = records[0];

  if (isEmpty(record)) {
    throw new ApiAnnuaireNotFoundError("No record found for siret", {
      cause: new AssertionError({
        actual: siret,
        expected: "siret matching an établissement",
        message: "No établissement found in annuaire for the provided siret",
        operator: "isEmpty",
      }),
    });
  }

  const {
    record: {
      fields: { mail },
    },
  } = record;

  if (!isString(mail)) {
    throw new ApiAnnuaireInvalidEmailError("Mail field is not a string", {
      cause: new AssertionError({
        actual: typeof mail,
        expected: "string",
        message: "Mail field must be a string",
        operator: "isString",
      }),
    });
  }

  const formattedEmail = mail.toLowerCase().trim();

  if (!isEmailValid(formattedEmail)) {
    throw new ApiAnnuaireInvalidEmailError("Email format is invalid", {
      cause: new AssertionError({
        actual: formattedEmail,
        expected: "valid email format",
        message: "Email must be in valid format",
        operator: "isEmailValid",
      }),
    });
  }

  if (!FEATURE_USE_ANNUAIRE_EMAILS) {
    logger.info(
      `Test email address ${TEST_CONTACT_EMAIL} was used instead of the real one ${formattedEmail}.`,
    );
    return TEST_CONTACT_EMAIL;
  }

  return formattedEmail;
};
