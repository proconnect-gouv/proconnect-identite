//

import { fetch_crisp } from "#src/client/fetcher.js";
import { defineConfig } from "#testing/config";
import assert from "node:assert/strict";
import { test } from "node:test";

//

const config = defineConfig();

test(
  "find douglas.duteil@beta.gouv.fr",
  { skip: config.key === undefined },
  async () => {
    const operators = await fetch_crisp(config, {
      endpoint: `/v1/website/${config.website_id}/operators/list`,
      method: "GET",
      searchParams: {},
    });

    const operator = operators.find(
      ({ details }) => details.email === "moncomptepro@beta.gouv.fr",
    )!;

    assert.deepEqual(operator, {
      details: {
        email: "moncomptepro@beta.gouv.fr",
        first_name: "Raphaël",
        last_name: "Dubigny",
        user_id: "1000e693-514d-43fe-8eaa-f4fed891f1e0",
      },
      type: "sandbox",
    });
  },
);
