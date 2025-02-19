//

import type { Config } from "#src/types";

const {
  CRISP_BASE_URL,
  CRISP_IDENTIFIER,
  CRISP_KEY,
  CRISP_PLUGIN_URN,
  CRISP_USER_NICKNAME,
  CRISP_WEBSITE_ID,
  DEBUG,
} = process.env;

export const config = {
  base_url: CRISP_BASE_URL!,
  debug: Boolean(DEBUG),
  identifier: CRISP_IDENTIFIER!,
  key: CRISP_KEY!,
  plugin_urn: CRISP_PLUGIN_URN as `urn:${string}`,
  user_nickname: CRISP_USER_NICKNAME!,
  website_id: CRISP_WEBSITE_ID!,
} satisfies Config;

export function defineConfig(input = config): Config {
  return input;
}
