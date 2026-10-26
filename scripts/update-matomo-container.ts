// Vendors the Matomo Tag Manager (MTM) container published on stats.data.gouv.fr.
//
// The container is self-hosted in public/matomo (served as-is under /dist/matomo) so that
// the CSP script-src does not need to allow stats.data.gouv.fr, and so that any change to
// the tracking code goes through code review. Changes published in MTM are therefore
// not picked up automatically: run this script after each MTM publication, then review
// the diff. Only Matomo tags are expected; Custom HTML tags or tags loading third-party
// scripts would be blocked by the CSP.
//
// The ?v= cache-busting parameter of the script tag in head.ejs is updated with a hash
// of the container, since /dist is served with a long max-age.
//
// usage : npm run update-matomo-container

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const CONTAINER_FILE = "container_yr4sXd50.js";
const CONTAINER_URL = `https://stats.data.gouv.fr/js/${CONTAINER_FILE}`;
const root = resolve(import.meta.dirname, "..");
const containerPath = resolve(root, "public/matomo", CONTAINER_FILE);
const headPath = resolve(root, "src/views/partials/head.ejs");

const response = await fetch(CONTAINER_URL);
if (!response.ok) {
  throw new Error(`GET ${CONTAINER_URL} failed: ${response.status}`);
}
const content = Buffer.from(await response.arrayBuffer());
await writeFile(containerPath, content);

const version = createHash("sha256").update(content).digest("hex").slice(0, 8);
const head = await readFile(headPath, "utf8");
const scriptSrcPattern = new RegExp(
  `(/dist/matomo/${CONTAINER_FILE.replace(".", "\\.")}\\?v=)[^"]*`,
);
if (!scriptSrcPattern.test(head)) {
  throw new Error(`Matomo container script tag not found in ${headPath}`);
}
await writeFile(headPath, head.replace(scriptSrcPattern, `$1${version}`));

console.log(`Updated ${containerPath} (v=${version})`);
