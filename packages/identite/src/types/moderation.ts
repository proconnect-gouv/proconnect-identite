//

import * as z from "zod";

//

export const ModerationStatusSchema = z.enum([
  "accepted",
  "pending",
  "rejected",
  "unknown",
]);
export type ModerationStatus = z.output<typeof ModerationStatusSchema>;

export const ModerationTypeSchema = z.enum([
  "non_verified_domain",
  "organization_join_block",
]);
export type ModerationType = z.output<typeof ModerationTypeSchema>;

export const ModerationSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  organization_id: z.number(),
  ticket_id: z.string().nullable(),
  type: ModerationTypeSchema,
  created_at: z.date(),
  moderated_at: z.date().nullable(),
  comment: z.string().nullable(),
  moderated_by: z.string().nullable(),
  status: ModerationStatusSchema,
});

export type Moderation = z.output<typeof ModerationSchema>;
