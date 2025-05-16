FROM node:24-slim AS base
RUN corepack enable

RUN --mount=type=bind,source=package.json,target=package.json \
  corepack prepare --activate

WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=package-lock.json,target=package-lock.json \
  --mount=type=bind,source=packages/core/package.json,target=packages/core/package.json \
  --mount=type=bind,source=packages/crisp/package.json,target=packages/crisp/package.json \
  --mount=type=bind,source=packages/debounce/package.json,target=packages/debounce/package.json \
  --mount=type=bind,source=packages/devtools/typescript/package.json,target=packages/devtools/typescript/package.json \
  --mount=type=bind,source=packages/email/package.json,target=packages/email/package.json \
  --mount=type=bind,source=packages/entreprise/package.json,target=packages/entreprise/package.json \
  --mount=type=bind,source=packages/identite/package.json,target=packages/identite/package.json \
  --mount=type=bind,source=packages/testing/package.json,target=packages/testing/package.json \
  --mount=type=cache,sharing=locked,target=/root/.npm \
  corepack npm ci --omit=dev

FROM base AS build
ENV CYPRESS_INSTALL_BINARY=0
RUN --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=package-lock.json,target=package-lock.json \
  --mount=type=bind,source=packages/core/package.json,target=packages/core/package.json \
  --mount=type=bind,source=packages/crisp/package.json,target=packages/crisp/package.json \
  --mount=type=bind,source=packages/debounce/package.json,target=packages/debounce/package.json \
  --mount=type=bind,source=packages/devtools/typescript/package.json,target=packages/devtools/typescript/package.json \
  --mount=type=bind,source=packages/email/package.json,target=packages/email/package.json \
  --mount=type=bind,source=packages/entreprise/package.json,target=packages/entreprise/package.json \
  --mount=type=bind,source=packages/identite/package.json,target=packages/identite/package.json \
  --mount=type=bind,source=packages/testing/package.json,target=packages/testing/package.json \
  --mount=type=cache,sharing=locked,target=/root/.npm \
  corepack npm ci
COPY tsconfig.json vite.config.mjs ./
COPY assets/ ./assets/
COPY public/ ./public/
COPY src/ ./src/
COPY packages/ ./packages/
COPY package*.json ./
RUN corepack npx run-s build:*

FROM base
COPY package.json ./
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/src /app/src
COPY --from=build /app/packages /app/packages

CMD [ "corepack", "npm", "start" ]
