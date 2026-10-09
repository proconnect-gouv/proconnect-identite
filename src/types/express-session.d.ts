import type { z } from "zod";
import type {
  AmrValueSchema,
  SessionDataSchema,
  UnauthenticatedSessionDataSchema,
} from "../managers/session/session-data";

export type AmrValue = z.output<typeof AmrValueSchema>;

export interface AuthenticatedSessionData {
  amr: AmrValue[];
  user: User;
}

export type UnauthenticatedSessionData = z.output<
  typeof UnauthenticatedSessionDataSchema
>;

declare module "express-session" {
  export interface SessionData extends z.output<typeof SessionDataSchema> {}
}
