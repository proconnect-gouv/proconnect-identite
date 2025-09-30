//

import { FRANCECONNECT_CITIZENS } from "#src/api/data/franceconnect";
import { zValidator } from "@hono/zod-validator";
import {
  FranceConnectUserInfoResponseSchema,
  type FranceConnectUserInfoResponse,
} from "@proconnect-gouv/proconnect.identite/types";
import assert from "assert/strict";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { CompactSign, generateKeyPair } from "jose";
import { z } from "zod";
import LogoutPage from "./logout.page.js";
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
  grant_type: z.string(),
  redirect_uri: z.string(),
});

const AuthorizationEndpointQueryParams = z.object({
  acr_values: z.literal("eidas1"),
  claims: z.string().optional(),
  client_id: z.string(),
  nonce: z.string().min(22),
  prompt: z.string().default("login"),
  redirect_uri: z.string(),
  response_type: z.string(),
  scope: z.string(),
  state: z.string().min(22),
});

//

let userinfo: FranceConnectUserInfoResponse;

//

export const TestingOidcFranceConnectRouter = new Hono<{
  Bindings: FranceConnectBindings;
}>()
  .onError((error, { text }) => {
    console.error("[🎭] ", error);
    return text(error.toString());
  })
  .get("/healthz", ({ text }) => text("ok"))
  .get(
    "/api/v2/.well-known/openid-configuration",
    ({ json, env: { ISSUER } }) => json(wellKnown(ISSUER)),
  )
  .get(
    "/api/v2/authorize",
    zValidator("query", AuthorizationEndpointQueryParams),
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
  .get(
    "/api/v2/session/end",
    zValidator(
      "query",
      z.object({
        id_token_hint: z.string(),
        post_logout_redirect_uri: z.string().url(),
        state: z.string(),
      }),
    ),
    ({ req }) => {
      const { post_logout_redirect_uri, state } = req.valid("query");

      const redirect_url = new URL(post_logout_redirect_uri);
      redirect_url.searchParams.set("state", state);

      const html = new TextEncoder().encode(
        LogoutPage({
          redirect_url: redirect_url.href,
        }),
      );

      const stream = new ReadableStream({
        async start(controller) {
          controller.enqueue(html);
          await new Promise((resolve) => setTimeout(resolve, 1_111));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          "Transfer-Encoding": "chunked",
        },
        status: 303,
      });
    },
  )
  .post(
    "/api/v2/token",
    zValidator("form", CodeParamSchema),
    async ({ env: { ISSUER }, json, req }) => {
      const form = req.valid("form");
      const { code } = form;

      const codeObj = CODE_MAP.get(code);
      assert.ok(codeObj);
      CODE_MAP.delete(code);

      const { client_id, nonce } = codeObj;
      assert.equal(codeObj.redirect_uri, form.redirect_uri);

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
    secureHeaders({
      contentSecurityPolicy: {
        styleSrcElem: ["'self'", "unpkg.com"],
        imgSrc: ["'self'", "data:", "avataaars.io"],
      },
    }),
    zValidator("param", z.object({ code: z.string() })),
    async ({ html }) =>
      html(
        SelectPage({ citizens: Array.from(FRANCECONNECT_CITIZENS.values()) }),
      ),
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
