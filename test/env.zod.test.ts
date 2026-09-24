//

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { parseEnv } from "node:util";
import { envSchema } from "../src/config/env.zod";

//

// Every `.env*` file must, on its own (merged with the shared `.env`),
// provide all the variables required by `envSchema`, since env.zod.ts no
// longer defines any default value: they are all defined in the
// `.env.<environment>` files instead.
const ENVIRONMENTS = ["development", "test", "production", "e2e"] as const;

function loadDotenvFile(filename: string) {
  return parseEnv(
    readFileSync(path.resolve(import.meta.dirname, "..", filename), "utf8"),
  );
}

describe("env.zod", () => {
  it("no longer declares default values", () => {
    const source = readFileSync(
      path.resolve(import.meta.dirname, "../src/config/env.zod.ts"),
      "utf8",
    );

    assert.equal(
      /\.default\(/.test(source),
      false,
      "env.zod.ts should not declare any `.default(...)`, values must live in the .env.<environment> files",
    );
  });

  for (const environment of ENVIRONMENTS) {
    it(`accepts the ".env" + ".env.${environment}" combination`, () => {
      const env = {
        ...loadDotenvFile(".env"),
        ...loadDotenvFile(`.env.${environment}`),
      };

      // production doesn't commit real secrets, they are provided by the
      // real deployment environment instead
      if (environment === "production") {
        Object.assign(env, {
          DATABASE_URL: "postgres://user:pass@localhost:5432/db",
          SMTP_URL: "smtp://localhost:1025",
          SYMMETRIC_ENCRYPTION_KEY:
            "aTrueRandom32BytesLongBase64EncodedStringAA=",
          SESSION_COOKIE_SECRET: "aSecret",
          JWKS: JSON.stringify({ keys: [] }),
        });
      }

      const result = envSchema.safeParse(env);

      assert.equal(
        result.success,
        true,
        result.success
          ? undefined
          : result.error.issues.map((issue) => issue.message).join("\n"),
      );
    });
  }

  it("rejects an env missing a required variable", () => {
    const env = {
      ...loadDotenvFile(".env"),
      ...loadDotenvFile(".env.development"),
    };

    delete (env as Record<string, string>).DATABASE_URL;

    const result = envSchema.safeParse(env);

    assert.equal(result.success, false);
  });
});
