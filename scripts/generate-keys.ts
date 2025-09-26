// src https://github.com/panva/node-oidc-provider-example/blob/d770e3387539d766d65a83cde52596b36f998a7d/01-oidc-configured/generate-keys.js
// usage : tsx ./scripts/generate-keys.ts | xclip -selection c
// paste the result in a JWKS env var

import { create_jwks } from "../src/config/jwks";

console.log(JSON.stringify(await create_jwks()));
