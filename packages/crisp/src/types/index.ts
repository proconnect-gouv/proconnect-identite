//

export interface Config {
  base_url: string;
  debug?: boolean;
  identifier: string;
  key: string;
  plugin_urn: `urn:${string}` | string;
  user_nickname: string;
  website_id: string;
}

export interface Operator {
  type: "operator" | "invite" | "sandbox";
  details: {
    email: string;
    first_name: string;
    last_name: string;
    role?: "owner" | "member";
    user_id: string;
  };
}

export interface User {
  user_id?: string;
  avatar: string;
  nickname: string;
  type: ("website" | "participant")[];
}

export interface Conversation {
  created_at: number;
  last_message: string;
  meta: ConversationMeta;
}

export interface ConversationMeta {
  address?: string;
  avatar: string;
  data: object;
  email: string;
  ip: string;
  nickname: string;
  phone: string;
  segments: string[];
  device: object;
  subject?: string;
}

export type ConversationState = "pending" | "resolved" | "unresolved";
export type Channel = "chat" | "email" | `urn:${string}`;

export interface ConversationMessage {
  session_id: string;
  website_id: string;
  type: "text" | "note" | "file";
  from: "operator" | "user";
  origin: Channel;
  content: string;
  edited: boolean;
  fingerprint: number;
  timestamp: number;
  read: Channel | "";
  delivered: Channel | "";
  user: User;
}
