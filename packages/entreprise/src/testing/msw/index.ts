//

import { bypass, http, HttpResponse } from "msw";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { format } from "prettier";

//

export function findOrganisationBySiret({
  snapshot_dir,
}: {
  snapshot_dir: string;
}) {
  return http.get(
    "https://*entreprise.api.gouv.fr/v3/insee/sirene/etablissements/:siret",
    async ({ params, request }) => {
      const { siret } = params as { siret: string };
      if (process.env["UPDATE_SNAPSHOT"]) {
        const response = await fetch(bypass(request));
        const content = await response.text();
        await mkdir(snapshot_dir, { recursive: true });
        await writeFile(
          join(snapshot_dir, `${siret}.json`),
          await format(content, { parser: "json" }),
        );
        return HttpResponse.text(content);
      }
      const data = await readFile(join(snapshot_dir, `${siret}.json`), "utf8");
      return HttpResponse.text(data);
    },
  );
}

export function findMandatairesSociauxBySiren({
  snapshot_dir,
}: {
  snapshot_dir: string;
}) {
  return http.get(
    "https://*entreprise.api.gouv.fr/v3/infogreffe/rcs/unites_legales/:siren/mandataires_sociaux",
    async ({ params, request }) => {
      const { siren } = params as { siren: string };
      console.log({ params });
      if (process.env["UPDATE_SNAPSHOT"]) {
        const response = await fetch(bypass(request));
        const content = await response.text();
        await mkdir(snapshot_dir, { recursive: true });
        await writeFile(
          join(snapshot_dir, `${siren}.json`),
          await format(content, { parser: "json" }),
        );
        return HttpResponse.text(content);
      }
      const data = await readFile(join(snapshot_dir, `${siren}.json`), "utf8");
      return HttpResponse.text(data);
    },
  );
}
