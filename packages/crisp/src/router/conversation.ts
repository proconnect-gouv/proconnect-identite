//

import type {
  Conversation,
  ConversationMessage,
  ConversationMeta,
  ConversationState,
  User,
} from "#src/types";

//

/**
 * Create A New Conversation
 * @see https://docs.crisp.chat/references/rest-api/v1/#create-a-new-conversation
 */
export type CreateConversationRoute = {
  request: {
    endpoint: `/v1/website/${string}/conversation`;
    method: "POST";
    //
    searchParams: {};
  };
  response: {
    data: { session_id: string };
  };
};

/**
 * Get A Conversation
 * @see https://docs.crisp.chat/references/rest-api/v1/#get-a-conversation
 */
export type GetConversationRoute = {
  request: {
    readonly endpoint: `/v1/website/${string}/conversation/${string}`;
    readonly method: "GET";
    //
    searchParams: {};
  };
  response: {
    data: Conversation;
  };
};

/**
 * Remove A Conversation
 * @see https://docs.crisp.chat/references/rest-api/v1/#remove-a-conversation
 */
export type RemoveConversationRoute = {
  request: {
    endpoint: `/v1/website/${string}/conversation/${string}`;
    method: "DELETE";
    //
    searchParams: {};
  };
  response: {
    data: {};
    reason: "deleted";
  };
};

/**
 * Get Messages In Conversation
 * @see https://docs.crisp.chat/references/rest-api/v1/#get-messages-in-conversation
 */
export type GetMessagesInAConversationRoute = {
  request: {
    readonly endpoint: `/v1/website/${string}/conversation/${string}/messages`;
    readonly method: "GET";
    //
    searchParams: { timestamp_before?: string };
  };
  response: {
    data: ConversationMessage[];
    reason: "listed";
  };
};

/**
 * Send A Message In A Conversation
 * @see https://docs.crisp.chat/references/rest-api/v1/#send-a-message-in-conversation
 */
export type SendMessageInAConversationRoute = {
  request: {
    method: "POST";
    endpoint: `/v1/website/${string}/conversation/${string}/message`;
    searchParams: {};
    body: {
      type: "text";
      origin: `urn:${string}`;
      from: "operator";
      content: string;
      user: Partial<User>;
    };
  };
  response: {
    data: { fingerprint: number };
    reason: "dispatched";
  };
};

/**
 * Get Conversation Meta
 * @see https://docs.crisp.chat/references/rest-api/v1/#get-conversation-metas
 */
export type GetConversationMetaRoute = {
  request: {
    readonly endpoint: `/v1/website/${string}/conversation/${string}/meta`;
    readonly method: "GET";
    //
    searchParams: {};
  };
  response: {
    data: ConversationMeta;
    reason: "resolved";
  };
};

/**
 * Update Conversation Metas
 * @see https://docs.crisp.chat/references/rest-api/v1/#update-conversation-metas
 */
export type UpdateConversationMetaRoute = {
  request: {
    endpoint: `/v1/website/${string}/conversation/${string}/meta`;
    method: "PATCH";
    //
    searchParams: {};
    body: Partial<ConversationMeta>;
  };
  response: {
    data: {};
    reason: "updated";
  };
};

/**
 * Get Conversation State
 * @see https://docs.crisp.chat/references/rest-api/v1/#get-conversation-state
 */
export type GetConversationStateRoute = {
  request: {
    endpoint: `/v1/website/${string}/conversation/${string}/state`;
    method: "GET";
    //
    searchParams: {};
  };
  response: {
    data: {
      state: ConversationState;
    };
    reason: "resolved";
  };
};

/**
 * Change Conversation State
 * @see https://docs.crisp.chat/references/rest-api/v1/#change-conversation-state
 */
export type UpdateConversationStateRoute = {
  request: {
    endpoint: `/v1/website/${string}/conversation/${string}/state`;
    method: "PATCH";
    //
    body: {
      state: ConversationState;
    };
    searchParams: {};
  };
  response: {
    data: {};
    reason: "updated";
  };
};

export type ConversationRouter =
  | CreateConversationRoute
  | GetConversationMetaRoute
  | GetConversationRoute
  | GetConversationStateRoute
  | GetMessagesInAConversationRoute
  | RemoveConversationRoute
  | SendMessageInAConversationRoute
  | UpdateConversationMetaRoute
  | UpdateConversationStateRoute;
