import { z } from "zod";

export const BaseOfficialContactEmailVerificationSchema = z.object({
  organization_id: z.number(),
  sent_at: z.date().nullable(),
  token: z.string().nullable(),
  user_id: z.number(),
});

export type BaseOfficialContactEmailVerification = z.output<
  typeof BaseOfficialContactEmailVerificationSchema
>;

export const OfficialContactEmailVerificationSchema =
  BaseOfficialContactEmailVerificationSchema.extend({
    created_at: z.date(),
    updated_at: z.date(),
  });

export type OfficialContactEmailVerification = z.output<
  typeof OfficialContactEmailVerificationSchema
>;

export const FindOfficialContactEmailVerificationSchema =
  OfficialContactEmailVerificationSchema.pick({
    organization_id: true,
    user_id: true,
  });

export type FindOfficialContactEmailVerification = z.output<
  typeof FindOfficialContactEmailVerificationSchema
>;
