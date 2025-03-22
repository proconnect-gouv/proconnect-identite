//
import {
  FranceConnectUserInfoResponseSchema,
  type FranceConnectUserInfoResponse,
} from "@gouvfr-lasuite/proconnect.identite/types";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { CompactSign, generateKeyPair } from "jose";
import { z } from "zod";
import SelectPage from "./select.page.js";
import wellKnown from "./well-known.js";

//

export interface FranceConnectBindings {
  ISSUER: string;
}

//

const CODE_MAP = new Map<
  string,
  { client_id: string; nonce: string; state: string; redirect_uri: string }
>();

const SUB_VALUE = "🎭 FranceConnect Sub";
const DEFAULT_USERINFO: FranceConnectUserInfoResponse = {
  birthdate: new Date("2001-01-01"),
  birthplace: "Internet",
  family_name: "Dupont",
  gender: "male",
  given_name: "Jean",
  preferred_username: "Dulac",
  sub: SUB_VALUE,
};

const CodeParamSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
});

//

let userinfo: FranceConnectUserInfoResponse;

//

export const TestingOidcFranceConnectRouter = new Hono<{
  Bindings: FranceConnectBindings;
}>()
  .get("/", ({ text }) => text("🎭 FranceConnect theater"))
  .get(
    "/api/v2/.well-known/openid-configuration",
    ({ json, env: { ISSUER } }) => json(wellKnown(ISSUER)),
  )
  .get(
    "/api/v2/authorize",
    zValidator(
      "query",
      z.object({
        client_id: z.string(),
        redirect_uri: z.string(),
        response_type: z.string(),
        scope: z.string(),
        state: z.string(),
        nonce: z.string(),
      }),
    ),
    async ({ req, redirect }) => {
      const { client_id, redirect_uri, state, nonce } = req.valid("query");
      const codeValue = `_${Date.now()}`;
      CODE_MAP.set(codeValue, { client_id, nonce, redirect_uri, state });
      const basePath = new URL(req.url).pathname
        .split("/")
        .slice(0, -3)
        .join("/");

      return redirect(`${basePath}/interaction/${codeValue}/login`);
    },
  )
  .post(
    "/api/v2/token",
    zValidator("form", CodeParamSchema),
    async ({ env: { ISSUER }, json, req }) => {
      const { code } = req.valid("form");
      const codeObj = CODE_MAP.get(code);
      if (!codeObj) {
        throw new Error("Invalid authorization code");
      }
      CODE_MAP.delete(code);
      const { client_id, nonce } = codeObj;

      const { privateKey } = await generateKeyPair("ES256");

      const id_token = await new CompactSign(
        Buffer.from(
          JSON.stringify({
            iss: ISSUER,
            aud: client_id,
            exp: Math.floor(Date.now() / 1000) + 3600,
            iat: Math.floor(Date.now() / 1000),
            nonce,
            sub: SUB_VALUE,
          }),
        ),
      )
        .setProtectedHeader({
          alg: "ES256",
          typ: "JWT",
        })
        .sign(privateKey);

      return json({
        access_token: "==MOCK_FC_ACCESS_TOKEN==",
        token_type: "bearer",
        expires_in: 3600,
        id_token,
        refresh_token: "==MOCK_FC_REFRESH_TOKEN==",
        scope: Object.keys(DEFAULT_USERINFO).join(" "),
      });
    },
  )
  .get("/api/v2/userinfo", ({ json }) => json(userinfo))
  .get(
    "/interaction/:code/login",
    zValidator("param", z.object({ code: z.string() })),
    async ({ html }) => {
      return html(SelectPage({ userinfo: DEFAULT_USERINFO }));
    },
  )
  .post(
    "/interaction/:code/login",
    zValidator("param", z.object({ code: z.string() })),
    zValidator("form", FranceConnectUserInfoResponseSchema),
    async ({ env: { ISSUER }, req, redirect }) => {
      const { code } = req.valid("param");
      const codeObj = CODE_MAP.get(code);
      if (!codeObj) throw new Error("Invalid authorization code");

      const info = req.valid("form");

      userinfo = {
        ...DEFAULT_USERINFO,
        ...info,
        sub: SUB_VALUE,
      };

      const { redirect_uri } = codeObj;
      const redirectParams = new URLSearchParams({
        code,
        iss: ISSUER,
        state: codeObj.state,
      });
      return redirect(`${redirect_uri}?${redirectParams}`);
    },
  );
