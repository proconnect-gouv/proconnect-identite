//

import { createServer, type Server } from "http";
import type { AddressInfo } from "net";
import { equal } from "node:assert/strict";
import { describe, it } from "node:test";
import { join } from "path";
import { createTestingHandler } from "../src/api";

//
async function HttpTestingServer() {
  const basePath = "/___";
  const { promise, resolve, reject } = Promise.withResolvers<Server>();
  const server = createServer(
    createTestingHandler(basePath, {
      ISSUER: "oidc.franceconnect.localhost",
      log: console.log,
    }),
  )
    .on("error", reject)
    .listen(0, () => resolve(server));
  await promise;
  const address = server.address() as AddressInfo;

  return {
    fetch(path: string, init?: RequestInit) {
      return fetch(
        join(`http://localhost:${address.port}`, basePath, path),
        init,
      );
    },
    [Symbol.dispose]: () => {
      server.close();
    },
  };
}

describe("GET /healthz --> 200 OK", () => {
  it("200 OK", async () => {
    using http = await HttpTestingServer();
    const response = await http.fetch("/healthz");
    equal(response.status, 200);
    equal(response.statusText, "OK");
    equal(await response.text(), "ok");
  });
});

describe("GET /entreprise.api.gouv.fr/healthz --> 200 OK", () => {
  it("200 OK", async () => {
    using http = await HttpTestingServer();
    const response = await http.fetch("/entreprise.api.gouv.fr/healthz");
    equal(response.status, 200);
    equal(response.statusText, "OK");
    equal(await response.text(), "ok");
  });
});

describe("GET /oidc.franceconnect.gouv.fr/healthz --> 200 OK", () => {
  it("200 OK", async () => {
    using http = await HttpTestingServer();
    const response = await http.fetch("/oidc.franceconnect.gouv.fr/healthz");
    equal(response.status, 200);
    equal(response.statusText, "OK");
    equal(await response.text(), "ok");
  });
});

describe("GET /oidc.franceconnect.gouv.fr/v3/infogreffe/rcs/unites_legales/213401268/mandataires_sociaux --> 200 OK", () => {
  it("200 OK", async () => {
    using http = await HttpTestingServer();
    const response = await http.fetch(
      "/oidc.franceconnect.gouv.fr/v3/infogreffe/rcs/unites_legales/213401268/mandataires_sociaux",
    );
    equal(response.status, 200);
    equal(response.statusText, "OK");
    equal(await response.text(), "ok");
  });
});

describe("GET /oidc.franceconnect.gouv.fr/v3/infogreffe/rcs/unites_legales/453340176/mandataires_sociaux --> 200 OK", () => {
  it("200 OK", async () => {
    using http = await HttpTestingServer();
    const response = await http.fetch(
      "/oidc.franceconnect.gouv.fr/v3/infogreffe/rcs/unites_legales/453340176/mandataires_sociaux",
    );
    equal(response.status, 200);
    equal(response.statusText, "OK");
    equal(await response.text(), "ok");
  });
});
