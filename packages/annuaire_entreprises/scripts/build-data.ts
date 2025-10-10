#!/usr/bin/env tsx

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const packageRoot = join(__dirname, "..");
const dataDir = join(packageRoot, "data");

// Read commit hash from data/.commit
const commitPath = join(dataDir, ".commit");
const commit = (await readFile(commitPath, "utf-8")).trim();

console.log(`📦 Fetching data from search-infra@${commit.slice(0, 7)}`);

const files = [
  "administration_nature_juridique.json",
  "administration_siren_blacklist.json",
  "administration_siren_whitelist.json",
];

const baseUrl = `https://raw.githubusercontent.com/annuaire-entreprises-data-gouv-fr/search-infra/${commit}/helpers/labels`;

await mkdir(dataDir, { recursive: true });

for (const file of files) {
  const url = `${baseUrl}/${file}`;
  console.log(`📥 Fetching ${file}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
  }

  const content = await response.text();
  await writeFile(join(dataDir, file), content, "utf-8");
  console.log(`✅ Wrote ${file}`);
}

console.log("🎉 Data build complete");
