import { z } from "zod";

export const activityContextSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("franceconnect_data_sync"),
    context: z.object({}).strict(),
  }),
  z.object({
    action: z.literal("personal_info_edited"),
    context: z
      .object({
        before: z.record(z.string(), z.string().nullable()),
        after: z.record(z.string(), z.string().nullable()),
      })
      .strict(),
  }),
  z.object({
    action: z.literal("user_self_deleted"),
    context: z.object({}).strict(),
  }),
  z.object({
    action: z.literal("moderation_reopened"),
    context: z.object({}).strict(),
  }),
  z.object({
    action: z.literal("moderation_cancelled"),
    context: z
      .object({
        moderation_snapshot: z.record(z.string(), z.unknown()),
      })
      .strict(),
  }),
]);

export type ActivityContext = z.infer<typeof activityContextSchema>;
