import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fromZodError } from "zod-validation-error";

import { z } from "zod";

import { fileURLToPath } from "node:url";
import { fetchAdministrationGristRecordsFactory } from "../connectors/administration-grist.js";

const SCRIPT_ZOD_SCHEMA = z.object({
  ADMINISTRATION_GRIST_URL: z.url(),
  ADMINISTRATION_GRIST_API_KEY: z.string(),
});

async function importGrist() {
  const parsedEnv = SCRIPT_ZOD_SCHEMA.safeParse(process.env);
  if (!parsedEnv.success) {
    throw fromZodError(parsedEnv.error, {});
  }

  const fetchAdministrationGristRecords =
    fetchAdministrationGristRecordsFactory({
      documentUrl: parsedEnv.data.ADMINISTRATION_GRIST_URL,
      apiKey: parsedEnv.data.ADMINISTRATION_GRIST_API_KEY,
    });
  const filename = "administration-grist.json";

  const __dirname = fileURLToPath(new URL(".", import.meta.url));
  const packageRoot = join(__dirname, "..");
  const dataDir = join(packageRoot, "data");

  const administrations = await fetchAdministrationGristRecords();
  const content = JSON.stringify(administrations, null, 2);

  await writeFile(join(dataDir, filename), content, "utf-8");

  console.log(`✅ Wrote ${filename}`);
}

importGrist();
