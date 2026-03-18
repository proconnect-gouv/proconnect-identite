//

import { PGlite } from "@electric-sql/pglite";
import type { FindMandatairesSociauxBySirenHandler } from "@proconnect-gouv/proconnect.api_entreprise/api/infogreffe";
import type {
  FindBySirenHandler,
  FindBySiretHandler,
} from "@proconnect-gouv/proconnect.api_entreprise/api/insee";
import type { FindPouvoirsBySirenHandler } from "@proconnect-gouv/proconnect.registre_national_entreprises/api";
import { noop } from "lodash-es";
import { runner } from "node-pg-migrate";
import { mock } from "node:test";
import { join } from "path";
import type { Pool } from "pg";
import type { FindUniteLegaleBySirenHandler } from "../../insee/src/api/find-by-siren.js";
import { createContext } from "../src/connectors/index.js";

//

export const pg = new PGlite();

export async function migrate() {
  await runner({
    dbClient: pg as any,
    dir: join(import.meta.dirname, "../../../migrations"),
    direction: "up",
    migrationsTable: "pg-migrate",
    log: noop,
  });
}

export async function emptyDatabase() {
  await pg.sql`delete from users_organizations;`;
  //
  await pg.sql`delete from organizations;`;
  await pg.sql`ALTER SEQUENCE organizations_id_seq RESTART WITH 1`;
  await pg.sql`delete from users;`;
  await pg.sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`;
  await pg.sql`delete from email_domains;`;
  await pg.sql`ALTER SEQUENCE email_domains_id_seq RESTART WITH 1`;
}

//

const should_not_been_called = () => Promise.reject(new Error("💣"));

export const api_entreprise_infogreffe_mock_client = {
  findMandatairesSociauxBySiren: mock.fn<FindMandatairesSociauxBySirenHandler>(
    should_not_been_called,
  ),
};
export const api_entreprise_insee_mock_client = {
  findBySiren: mock.fn<FindBySirenHandler>(should_not_been_called),
  findBySiret: mock.fn<FindBySiretHandler>(should_not_been_called),
};

export const api_insee_mock_client = {
  findBySiren: mock.fn<FindUniteLegaleBySirenHandler>(should_not_been_called),
};

export const api_registre_national_entreprises_mock_client = {
  findPouvoirsBySiren: mock.fn<FindPouvoirsBySirenHandler>(
    should_not_been_called,
  ),
};

export const context = createContext({
  api_entreprise_infogreffe_client: api_entreprise_infogreffe_mock_client,
  api_entreprise_insee_client: api_entreprise_insee_mock_client,
  api_insee_client: api_insee_mock_client,
  api_registre_national_entreprises_client:
    api_registre_national_entreprises_mock_client,
  pg: pg as Pool & PGlite,
});
