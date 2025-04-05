//

import { equal } from "node:assert/strict";
import { createServer, Server } from "node:http";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import { describe, it } from "node:test";
import { createTestingHandler } from "./index.js";

//

describe.skip("createTestingHandler", () => {
  // const httpTestingServer = () => {
  //   const server = createServer(
  //     createTestingHandler("/___testing___", {
  //       ISSUER: "oidc.franceconnect.localhost",
  //     }),
  //   );
  //   server.listen(0, () => {});
  //   return {
  //     [Symbol.dispose]: () => {
  //       server.close();
  //     },
  //   };
  // };

  // {
  //   using httpTestingServer
  // }
  it("should return a handler", async () => {
    // using httpTestingServer();
    // const res = server.re
    async function HttpTestingServer() {
      const basePath = "/___testing___";
      const { promise, resolve, reject } = Promise.withResolvers<Server>();
      const server = createServer(
        createTestingHandler(basePath, {
          ISSUER: "oidc.franceconnect.localhost",
          log() {},
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
          console.log("Hooray!");
        },
      };
    }

    using http = await HttpTestingServer();
    const response = await http.fetch("/healthz");
    console.log({ response });
    equal(response.status, 200);
    equal(response.statusText, "OK");
    equal(await response.text(), "ok");
  });
});
