//

import { fetch_crisp } from "@proconnect-gouv/proconnect.crisp/client";
import type {
  CreateConversationRoute,
  SendMessageInAConversationRoute,
  UpdateConversationMetaRoute,
  UpdateConversationStateRoute,
} from "@proconnect-gouv/proconnect.crisp/router";
import type { Config } from "@proconnect-gouv/proconnect.crisp/types";
import {
  CRISP_BASE_URL,
  CRISP_IDENTIFIER,
  CRISP_KEY,
  CRISP_MODERATION_TAG,
  CRISP_PLUGIN_URN,
  CRISP_RESOLVE_DELAY,
  CRISP_USER_NICKNAME,
  CRISP_WEBSITE_ID,
  WEBSITE_IDENTIFIER,
} from "../config/env";

//

const config: Config = {
  base_url: CRISP_BASE_URL,
  identifier: CRISP_IDENTIFIER || "",
  key: CRISP_KEY || "",
  plugin_urn: CRISP_PLUGIN_URN || "",
  user_nickname: CRISP_USER_NICKNAME,
  website_id: CRISP_WEBSITE_ID || "",
  debug: true,
};
//

export async function startCripsConversation({
  content,
  email,
  nickname,
  subject,
}: {
  content: string;
  email: string;
  nickname: string;
  subject: string;
}) {
  const { session_id } = await fetch_crisp<CreateConversationRoute>(config, {
    endpoint: `/v1/website/${config.website_id}/conversation`,
    method: "POST",
    searchParams: {},
  });

  await fetch_crisp<UpdateConversationMetaRoute>(config, {
    endpoint: `/v1/website/${config.website_id}/conversation/${session_id}/meta`,
    method: "PATCH",
    searchParams: {},
    body: {
      email,
      nickname,
      segments: ["email", ...CRISP_MODERATION_TAG, WEBSITE_IDENTIFIER],
      subject,
    },
  });

  await fetch_crisp<SendMessageInAConversationRoute>(config, {
    endpoint: `/v1/website/${config.website_id}/conversation/${session_id}/message`,
    method: "POST",
    searchParams: {},
    body: {
      type: "text",
      origin: `urn:${config.website_id}`,
      from: "operator",
      content,
      user: {
        nickname: config.user_nickname,
      },
    },
  });

  // HACK(douglasduteil): Wait for the message to be sent
  // Crisp seems to have a delay between the message being sent and the state being updated
  await new Promise((resolve) => setTimeout(resolve, CRISP_RESOLVE_DELAY));

  await fetch_crisp<UpdateConversationStateRoute>(config, {
    endpoint: `/v1/website/${config.website_id}/conversation/${session_id}/state`,
    method: "PATCH",
    searchParams: {},
    body: { state: "resolved" },
  });

  return session_id;
}
