//

import express from "express";
import { CompactSign, generateKeyPair } from "jose";
import morgan from "morgan";
import { http, HttpResponse } from "msw";
import { z } from "zod";
import SelectPage from "./select.page";
import wellKnown from "./well-known";

//

const SUB_VALUE = "🎭 FranceConnect Sub";
const codeMap = new Map<string, { client_id: string; nonce: string }>();

const TAGNAME = `[🎭]`;

morgan.token("prefix", () => TAGNAME);
export const FranceconnectFrontChannel = express()
  .use(morgan(":prefix :method :url :status :response-time ms"))
  .get("/api/v2/authorize", async (req, res) => {
    const codeValue = `🦆_${Date.now()}`;
    const query = z
      .object({
        client_id: z.string(),
        redirect_uri: z.string(),
        response_type: z.string(),
        scope: z.string(),
        state: z.string(),
        nonce: z.string(),
      })
      .parse(req.query);

    const { client_id, redirect_uri, state, nonce } = query;
    codeMap.set(codeValue, { client_id, nonce });

    return res.type("html").send(
      SelectPage({
        codeValue,
        redirect_uri,
        state,
      }),
    );
  })
  .use((req, _res, next) => {
    console.warn(
      [
        `Warning: intercepted a request without a matching request handler:`,
        "",
        `• ${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`,
        "",
        `If you still wish to intercept this unhandled request, please create a request handler for it.`,
      ]
        .map((line) => `${TAGNAME} ${line}`)
        .join("\n"),
    );

    next();
  });

export const franceconnectHandlers = [
  http.get(
    "http://localhost:8600/api/v2/.well-known/openid-configuration",
    () => {
      return HttpResponse.json(wellKnown);
    },
  ),

  http.get("http://localhost:8600/api/v2/userinfo", () => {
    // TODO(douglasduteil): find a way to get setted user from the front channel server
    return HttpResponse.json({
      sub: SUB_VALUE,
      given_name: "Jean",
      family_name: "Dupont",
      birthdate: "1970-01-01",
      birthplace: "Internet",
      gender: "male",
    });
  }),

  http.post("http://localhost:8600/api/v2/token", async ({ request }) => {
    const formData = await request.formData();
    const requestData = Object.fromEntries(formData.entries());
    const code = String(requestData.code);
    const codeObj = codeMap.get(code);
    if (!codeObj) {
      return HttpResponse.json(
        {
          error: "invalid_grant",
          error_description: "Invalid authorization code",
        },
        { status: 400 },
      );
    }
    codeMap.delete(code);
    const { client_id, nonce } = codeObj;

    const { privateKey } = await generateKeyPair("ES256");

    const id_token = await new CompactSign(
      Buffer.from(
        JSON.stringify({
          iss: "http://localhost:8600/api/v2",
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

    return HttpResponse.json({
      access_token: "==MOCK_FC_ACCESS_TOKEN==",
      token_type: "bearer",
      expires_in: 3600,
      id_token,
      refresh_token: "==MOCK_FC_REFRESH_TOKEN==",
      scope: [
        "birthplace",
        "birthdate",
        "family_name",
        "gender",
        "given_name",
        "openid",
        "preferred_username",
      ].join(" "),
    });
  }),
];
