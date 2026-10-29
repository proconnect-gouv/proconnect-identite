//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import {
  email_domains,
  users_organizations,
} from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { getMemberIdsPromotedByDomain } from "@proconnect-gouv/proconnect.identite/services/organization";
import {
  EmailDomainApprovedVerificationValues,
  EmailDomainPendingVerificationValues,
  EmailDomainRejectedVerificationValues,
  LinkEnum,
  type EmailDomainApprovedVerificationType,
} from "@proconnect-gouv/proconnect.identite/types";
import { and, eq, inArray, sql } from "drizzle-orm";

//

type MarkDomainAsVerifiedOutcome =
  | {
      kind: "domain_verified";
      activity_id: number;
      email_domain: {
        id: number;
        verification_type: EmailDomainApprovedVerificationType;
      };
      promoted_members: ReadonlyArray<{
        previous_verification_type: string;
        user_id: number;
      }>;
      replaced_verification_types: ReadonlyArray<string>;
    }
  | { kind: "organization_not_found"; organization_id: number };

export function markDomainAsVerifiedFactory({
  actor,
  app,
  db,
}: RuntimeContext) {
  return function markDomainAsVerified({
    domain,
    domain_verification_type,
    organization_id,
  }: {
    domain: string;
    domain_verification_type: EmailDomainApprovedVerificationType;
    organization_id: number;
  }): Promise<MarkDomainAsVerifiedOutcome> {
    return db.transaction(async (tx) => {
      const organization = await tx.query.organizations.findFirst({
        columns: { id: true },
        where: (table, { eq }) => eq(table.id, organization_id),
      });

      if (!organization) {
        return { kind: "organization_not_found", organization_id };
      }

      const memberships = await tx.query.users_organizations.findMany({
        columns: { user_id: true, verification_type: true },
        where: (table, { eq }) => eq(table.organization_id, organization_id),
        with: { user: { columns: { email: true } } },
      });
      const members = memberships.map(
        ({ user: { email }, user_id, verification_type }) => ({
          email,
          id: user_id,
          verification_type,
        }),
      );

      const promoted_member_ids = getMemberIdsPromotedByDomain({
        domain,
        members,
      });

      const promoted_members = memberships
        .filter(({ user_id }) => promoted_member_ids.includes(user_id))
        .map(({ user_id, verification_type }) => ({
          previous_verification_type: verification_type,
          user_id,
        }));

      const replaced = await tx
        .delete(email_domains)
        .where(
          and(
            eq(email_domains.organization_id, organization_id),
            eq(email_domains.domain, domain),
            inArray(email_domains.verification_type, [
              ...EmailDomainApprovedVerificationValues,
              ...EmailDomainPendingVerificationValues,
              ...EmailDomainRejectedVerificationValues,
            ]),
          ),
        )
        .returning({ verification_type: email_domains.verification_type });

      const [email_domain] = await tx
        .insert(email_domains)
        .values({
          domain,
          organization_id,
          verification_type: domain_verification_type,
          verified_at: sql`now()`,
        })
        .returning({ id: email_domains.id });

      const replaced_verification_types = replaced.map(
        ({ verification_type }) => verification_type,
      );

      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "domain.verified",
        actor,
        app,
        context: {
          inputs: { domain, verification_type: domain_verification_type },
          outcome: {
            email_domain_id: email_domain.id,
            replaced_verification_types,
          },
        },
        organization_id,
      });

      if (promoted_member_ids.length > 0) {
        await tx
          .update(users_organizations)
          .set({
            updated_at: sql`now()`,
            verification_type: LinkEnum.enum.domain,
          })
          .where(
            and(
              eq(users_organizations.organization_id, organization_id),
              inArray(users_organizations.user_id, promoted_member_ids),
            ),
          );

        for (const {
          previous_verification_type,
          user_id,
        } of promoted_members) {
          await insertActivity<ActivityContexts>(tx, {
            action: "member.promoted",
            actor: { type: "app", job: "domain.promote_members" },
            app,
            cause_activity_id: activity_id,
            context: {
              inputs: { previous_verification_type },
              outcome: { verification_type: LinkEnum.enum.domain },
            },
            organization_id,
            user_id,
          });
        }
      }

      return {
        kind: "domain_verified",
        activity_id,
        email_domain: {
          id: email_domain.id,
          verification_type: domain_verification_type,
        },
        promoted_members,
        replaced_verification_types,
      };
    });
  };
}
