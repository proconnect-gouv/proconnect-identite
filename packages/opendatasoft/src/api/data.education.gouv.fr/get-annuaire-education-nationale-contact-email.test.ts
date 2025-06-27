//

import { createOpendatasoftOpenApiClient } from "#src/client";
import {
  ApiOpendatasoftNotFoundError,
  ApiOpendatasoftUnprocessableEntityError,
  type ApiAnnuaireEducationNationaleRecords,
} from "#src/types";
import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { getAnnuaireEducationNationaleContactEmailFactory } from "./get-annuaire-education-nationale-contact-email.js";

describe("getAnnuaireEducationNationaleContactEmail", () => {
  it("should return Collège Jeanne d'Arc contact email", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            total_count: 1,
            results: [{ mail: "jeannedarc.millau@gmail.com" }],
          } as ApiAnnuaireEducationNationaleRecords),
        ),
      );
    });
    const client = createOpendatasoftOpenApiClient({
      baseUrl: "https://data.education.gouv.fr/api/explore/v2.1",
      fetch,
    });
    const getAnnuaireEducationNationaleContactEmail =
      getAnnuaireEducationNationaleContactEmailFactory(client);
    const contactEmail =
      await getAnnuaireEducationNationaleContactEmail("77672253000040");
    assert.equal(contactEmail, "jeannedarc.millau@gmail.com");
  });

  it("should return Lycée Younoussa Bamana contact email", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            total_count: 1,
            results: [{ mail: "lgt.bamana@ac-mayotte.fr" }],
          } as ApiAnnuaireEducationNationaleRecords),
        ),
      );
    });
    const client = createOpendatasoftOpenApiClient({
      baseUrl: "https://data.education.gouv.fr/api/explore/v2.1",
      fetch,
    });
    const getAnnuaireEducationNationaleContactEmail =
      getAnnuaireEducationNationaleContactEmailFactory(client);
    const contactEmail =
      await getAnnuaireEducationNationaleContactEmail("20000454700010");
    assert.equal(contactEmail, "lgt.bamana@ac-mayotte.fr");
  });

  it("should return valid email for a college and a lycee sharing the same SIRET", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            total_count: 2,
            results: [
              {
                nom_etablissement: "Collège Jeanne d'Arc",
                mail: "jeannedarc.👶@gmail.com",
              },
              {
                nom_etablissement: "Lycée professionnel privé Jeanne d'Arc",
                mail: "jeannedarc.👴@gmail.com",
              },
            ],
          } as ApiAnnuaireEducationNationaleRecords),
        ),
      );
    });
    const client = createOpendatasoftOpenApiClient({
      baseUrl: "https://data.education.gouv.fr/api/explore/v2.1",
      fetch,
    });
    const getAnnuaireEducationNationaleContactEmail =
      getAnnuaireEducationNationaleContactEmailFactory(client);
    const contactEmail =
      await getAnnuaireEducationNationaleContactEmail("77672253000040");
    assert.equal(contactEmail, "jeannedarc.👶@gmail.com");
  });

  it("❎ fail with no result", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            total_count: 0,
            results: [],
          } as ApiAnnuaireEducationNationaleRecords),
        ),
      );
    });
    const client = createOpendatasoftOpenApiClient({
      baseUrl: "https://data.education.gouv.fr/api/explore/v2.1",
      fetch,
    });
    const getAnnuaireEducationNationaleContactEmail =
      getAnnuaireEducationNationaleContactEmailFactory(client);
    await assert.rejects(
      getAnnuaireEducationNationaleContactEmail("⛩️"),
      new ApiOpendatasoftNotFoundError(),
    );
  });

  it("❎ fail with invalid email address.", async () => {
    const fetch = mock.fn(() => {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            total_count: 1,
            results: [{ mail: "📺" }],
          } as ApiAnnuaireEducationNationaleRecords),
        ),
      );
    });
    const client = createOpendatasoftOpenApiClient({
      baseUrl: "https://data.education.gouv.fr/api/explore/v2.1",
      fetch,
    });
    const getAnnuaireEducationNationaleContactEmail =
      getAnnuaireEducationNationaleContactEmailFactory(client);
    await assert.rejects(
      getAnnuaireEducationNationaleContactEmail("⛩️"),
      new ApiOpendatasoftUnprocessableEntityError(
        "📺 is not a valid email address.",
      ),
    );
  });
});
