//

import { fetch_crisp } from "#src/client/fetcher.js";
import type { Config } from "#src/types";
import { defineConfig } from "#testing/config";
import assert from "node:assert/strict";
import { test } from "node:test";
import type {
  GetConversationRoute,
  GetMessagesInAConversationRoute,
  SendMessageInAConversationRoute,
  UpdateConversationMetaRoute,
  UpdateConversationStateRoute,
} from "./conversation.js";

//

const config = defineConfig();

test(
  "create a new conversation",
  { skip: config.key === undefined },
  async () => {
    const config = defineConfig();
    const conversation = await fetch_crisp(config, {
      endpoint: `/v1/website/${config.website_id}/conversation`,
      method: "POST",
      searchParams: {},
    });

    assert.ok(
      conversation.session_id.startsWith("session_"),
      'Expected session_id to start with "session_"',
    );

    {
      const response = await delete_conversation(
        config,
        conversation.session_id,
      );
      assert.deepEqual(response, {});
    }
  },
);

test(
  "change conversation state",
  { skip: config.key === undefined },
  async () => {
    const conversation = await fetch_crisp(config, {
      endpoint: `/v1/website/${config.website_id}/conversation`,
      method: "POST",
      searchParams: {},
    });

    {
      const response = await fetch_crisp(config, {
        endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}/state`,
        method: "GET",
        searchParams: {},
      });
      assert.deepEqual(response, {
        state: "pending",
      });
    }

    {
      const response = await fetch_crisp<UpdateConversationStateRoute>(config, {
        endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}/state`,
        method: "PATCH",
        searchParams: {},
        body: { state: "resolved" },
      });

      assert.deepEqual(response, {});
    }

    {
      const response = await fetch_crisp(config, {
        endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}/state`,
        method: "GET",
        searchParams: {},
      });
      assert.deepEqual(response, {
        state: "resolved",
      });
    }

    await delete_conversation(config, conversation.session_id);
  },
);

test("send a message", { skip: config.key === undefined }, async () => {
  const config = defineConfig();
  const conversation = await fetch_crisp(config, {
    endpoint: `/v1/website/${config.website_id}/conversation`,
    method: "POST",
    searchParams: {},
  });

  {
    // Default meta
    const response = await fetch_crisp(config, {
      endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}/meta`,
      method: "GET",
      searchParams: {},
    });

    assert.partialDeepStrictEqual(response, {
      avatar: "",
      data: {},
      device: { geolocation: {} },
      email: "",
      nickname: "anonymous",
      phone: "",
      ip: "xxx",
      origin: "chat",
      segments: [],
    });
  }

  {
    const response = await fetch_crisp<UpdateConversationMetaRoute>(config, {
      endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}/meta`,
      method: "PATCH",
      searchParams: {},
      body: {
        email: "frodon.sacquet@theshire.middle-earth.com",
        nickname: "Frodon Sacquet",
        segments: ["email", "test"],
        subject: "Le Mordor Gandalf, c’est à gauche ou à droite ?",
      },
    });

    assert.deepEqual(response, {});
  }

  {
    const response = await fetch_crisp<SendMessageInAConversationRoute>(
      config,
      {
        endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}/message`,
        method: "POST",
        searchParams: {},
        body: {
          type: "text",
          origin: `urn:${config.website_id}`,
          from: "operator",
          content:
            "Nous sommes des amis de Gandhalf le gris. Pouvez-vous nous annoncer à lui ?",
          user: { nickname: "Frodon Sacquet" },
        },
      },
    );

    assert.ok(
      Number.isInteger(response.fingerprint),
      "Expected fingerprint to be an integer",
    );
  }

  // HACK(douglasduteil): wait for the actual api to react to the changes
  await new Promise((resolve) => setTimeout(resolve, 222));

  {
    const response = await fetch_crisp<GetConversationRoute>(config, {
      endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}`,
      method: "GET",
      searchParams: {},
    });

    assert.partialDeepStrictEqual(response, {
      last_message:
        "Nous sommes des amis de Gandhalf le gris. Pouvez-vous nous annoncer à lui ?",
      meta: {
        email: "frodon.sacquet@theshire.middle-earth.com",
        nickname: "Frodon Sacquet",
      },
    });
  }
  {
    const response = await fetch_crisp<GetMessagesInAConversationRoute>(
      config,
      {
        endpoint: `/v1/website/${config.website_id}/conversation/${conversation.session_id}/messages`,
        method: "GET",
        searchParams: {},
      },
    );

    assert.partialDeepStrictEqual(response, [
      {
        content:
          "Nous sommes des amis de Gandhalf le gris. Pouvez-vous nous annoncer à lui ?",
        delivered: "",
        from: "operator",
        mentions: [],
        origin: `urn:${config.website_id}`,
        preview: [],
        read: "",
        session_id: conversation.session_id,
        stamped: true,
        type: "text",
        user: {
          nickname: "Frodon Sacquet",
        },
        website_id: config.website_id,
      },
    ]);
  }

  await delete_conversation(config, conversation.session_id);
});

function delete_conversation(config: Config, session_id: string) {
  return fetch_crisp(config, {
    endpoint: `/v1/website/${config.website_id}/conversation/${session_id}`,
    method: "DELETE",
    searchParams: {},
  });
}
