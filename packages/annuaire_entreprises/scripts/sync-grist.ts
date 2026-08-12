import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { z } from "zod";

import { fileURLToPath } from "node:url";
import { fromZodError } from "zod-validation-error";
import {
  fetchAdministrationListGristRecordsFactory,
  fetchCodeJuridiqueToAdministrationGristRecordsFactory,
} from "../connectors/administration-grist.js";

const SCRIPT_ZOD_SCHEMA = z.object({
  ADMINISTRATION_GRIST_DOC_ID: z.string(),
  ADMINISTRATION_GRIST_API_KEY: z.string(),
});
const CODE_JURIDIQUE_TO_ADMINISTRATION_TABLE_ID =
  "Codes_juridiques_to_Administrations";
const ADMINISTRATION_WHITELIST_SIREN_TABLE_ID =
  "Administration_whitelist_siren";
const ADMINISTRATION_BLACKLIST_SIREN_TABLE_ID =
  "Administration_blacklist_siren_";

async function syncGristDocumentsToFiles() {
  const parsedEnv = SCRIPT_ZOD_SCHEMA.safeParse(process.env);
  if (!parsedEnv.success) {
    throw fromZodError(parsedEnv.error, {});
  }
  const { ADMINISTRATION_GRIST_API_KEY, ADMINISTRATION_GRIST_DOC_ID } =
    parsedEnv.data;

  await syncGristDocumentToFile({
    fetch: fetchCodeJuridiqueToAdministrationGristRecordsFactory({
      documentUrl: buildGristUrl(CODE_JURIDIQUE_TO_ADMINISTRATION_TABLE_ID),
      apiKey: ADMINISTRATION_GRIST_API_KEY,
    }),
    filename: "codes-juridiques-to-administration-grist.json",
  });

  await syncGristDocumentToFile({
    fetch: fetchAdministrationListGristRecordsFactory({
      documentUrl: buildGristUrl(ADMINISTRATION_WHITELIST_SIREN_TABLE_ID),
      apiKey: ADMINISTRATION_GRIST_API_KEY,
    }),
    filename: "administration_whitelist.json",
  });

  await syncGristDocumentToFile({
    fetch: fetchAdministrationListGristRecordsFactory({
      documentUrl: buildGristUrl(ADMINISTRATION_BLACKLIST_SIREN_TABLE_ID),
      apiKey: ADMINISTRATION_GRIST_API_KEY,
    }),
    filename: "administration_blacklist.json",
  });

  async function syncGristDocumentToFile<gristRecordT>({
    fetch,
    filename,
  }: {
    fetch: () => Promise<gristRecordT[]>;
    filename: string;
  }) {
    const records = await fetch();

    await storeGristDataToFile(filename, records);
  }

  function buildGristUrl(tableId: string) {
    return `https://grist.numerique.gouv.fr/api/docs/${ADMINISTRATION_GRIST_DOC_ID}/tables/${tableId}/records`;
  }

  async function storeGristDataToFile(filename: string, data: Object) {
    const content = JSON.stringify(data, null, 2);

    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    const packageRoot = join(__dirname, "..");
    const dataDir = join(packageRoot, "data");
    await writeFile(join(dataDir, filename), content, "utf-8");

    console.log(`✅ Wrote ${filename}`);
  }
}

syncGristDocumentsToFiles();
