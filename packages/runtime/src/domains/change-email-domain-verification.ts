//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import type { IdentiteTransaction } from "#src/database";
import { insertActivity } from "#src/journal";
import {
  email_domains,
  users_organizations,
} from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { getMembershipChangesByDomainVerification } from "@proconnect-gouv/proconnect.identite/services/organization";
import {
  EmailDomainApprovedVerificationValues,
  EmailDomainPendingVerificationValues,
  EmailDomainRejectedVerificationValues,
  LinkEnum,
  type EmailDomainNoPendingVerificationType,
} from "@proconnect-gouv/proconnect.identite/types";
import { and, eq, inArray, sql, type SQL } from "drizzle-orm";

//

type ChangeEmailDomainVerificationOutcome =
  | {
      kind: "domain_verification_changed";
      activity_id: number;
      email_domain: {
        id: number;
        verification_type: EmailDomainNoPendingVerificationType;
      };
      promoted_members: ReadonlyArray<{
        previous_verification_type: string;
        user_id: number;
      }>;
      removed_members: ReadonlyArray<{
        previous_verification_type: string;
        user_id: number;
      }>;
      replaced_verification_types: ReadonlyArray<string>;
    }
  | { kind: "organization_not_found"; organization_id: number };

type Member = Awaited<ReturnType<typeof findMembers>>[number];

export function changeEmailDomainVerificationFactory({
  actor,
  app,
  db,
}: RuntimeContext) {
  return function changeEmailDomainVerification({
    domain,
    organization_id,
    verification_type,
  }: {
    domain: string;
    organization_id: number;
    verification_type: EmailDomainNoPendingVerificationType;
  }): Promise<ChangeEmailDomainVerificationOutcome> {
    return db.transaction(async (tx) => {
      const organization = await tx.query.organizations.findFirst({
        columns: { id: true },
        where: (table, { eq }) => eq(table.id, organization_id),
      });

      if (!organization) {
        return { kind: "organization_not_found", organization_id };
      }

      const changes = getMembershipChangesByDomainVerification({
        domain,
        members: await findMembers(tx, { organization_id }),
        verification_type,
      });

      switch (changes.kind) {
        case "domain_approved": {
          const { email_domain_id, replaced_verification_types } =
            await replaceEmailDomain(tx, {
              domain,
              organization_id,
              verification_type: changes.verification_type,
              verified_at: sql`now()`,
            });
          const { activity_id } = await insertActivity<ActivityContexts>(tx, {
            action: "domain.verified",
            actor,
            app,
            context: {
              inputs: { domain, verification_type: changes.verification_type },
              outcome: { email_domain_id, replaced_verification_types },
            },
            organization_id,
          });

          await promoteMembers(tx, {
            app,
            cause_activity_id: activity_id,
            members: changes.promoted_members,
            organization_id,
          });

          return {
            kind: "domain_verification_changed",
            activity_id,
            email_domain: { id: email_domain_id, verification_type },
            promoted_members:
              changes.promoted_members.map(toPreviousMembership),
            removed_members: [],
            replaced_verification_types,
          };
        }
        case "domain_refused": {
          const { email_domain_id, replaced_verification_types } =
            await replaceEmailDomain(tx, {
              domain,
              organization_id,
              verification_type: changes.verification_type,
              verified_at: null,
            });
          const { activity_id } = await insertActivity<ActivityContexts>(tx, {
            action: "domain.refused",
            actor,
            app,
            context: {
              inputs: { domain, verification_type: changes.verification_type },
              outcome: { email_domain_id, replaced_verification_types },
            },
            organization_id,
          });

          await removeMembers(tx, {
            app,
            cause_activity_id: activity_id,
            members: changes.removed_members,
            organization_id,
          });

          return {
            kind: "domain_verification_changed",
            activity_id,
            email_domain: { id: email_domain_id, verification_type },
            promoted_members: [],
            removed_members: changes.removed_members.map(toPreviousMembership),
            replaced_verification_types,
          };
        }
        default: {
          const unhandled_changes: never = changes;
          throw new Error(
            `Unhandled membership changes: ${JSON.stringify(unhandled_changes)}`,
          );
        }
      }
    });
  };
}

//

async function findMembers(
  tx: IdentiteTransaction,
  { organization_id }: { organization_id: number },
) {
  const memberships = await tx.query.users_organizations.findMany({
    columns: { is_external: true, user_id: true, verification_type: true },
    where: (table, { eq }) => eq(table.organization_id, organization_id),
    with: { user: { columns: { email: true } } },
  });

  return memberships.map(
    ({ is_external, user: { email }, user_id, verification_type }) => ({
      email,
      is_external,
      user_id,
      verification_type,
    }),
  );
}

async function replaceEmailDomain(
  tx: IdentiteTransaction,
  {
    domain,
    organization_id,
    verification_type,
    verified_at,
  }: {
    domain: string;
    organization_id: number;
    verification_type: EmailDomainNoPendingVerificationType;
    verified_at: SQL | null;
  },
) {
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
    .values({ domain, organization_id, verification_type, verified_at })
    .returning({ id: email_domains.id });

  return {
    email_domain_id: email_domain.id,
    replaced_verification_types: replaced.map(
      ({ verification_type }) => verification_type,
    ),
  };
}

async function promoteMembers(
  tx: IdentiteTransaction,
  {
    app,
    cause_activity_id,
    members,
    organization_id,
  }: Pick<RuntimeContext, "app"> & {
    cause_activity_id: number;
    members: ReadonlyArray<Member>;
    organization_id: number;
  },
) {
  if (members.length === 0) return;

  await tx
    .update(users_organizations)
    .set({ updated_at: sql`now()`, verification_type: LinkEnum.enum.domain })
    .where(
      and(
        eq(users_organizations.organization_id, organization_id),
        inArray(
          users_organizations.user_id,
          members.map(({ user_id }) => user_id),
        ),
      ),
    );

  for (const { user_id, verification_type } of members) {
    await insertActivity<ActivityContexts>(tx, {
      action: "member.promoted",
      actor: { type: "app", job: "domain.promote_members" },
      app,
      cause_activity_id,
      context: {
        inputs: { previous_verification_type: verification_type },
        outcome: { verification_type: LinkEnum.enum.domain },
      },
      organization_id,
      user_id,
    });
  }
}

async function removeMembers(
  tx: IdentiteTransaction,
  {
    app,
    cause_activity_id,
    members,
    organization_id,
  }: Pick<RuntimeContext, "app"> & {
    cause_activity_id: number;
    members: ReadonlyArray<Member>;
    organization_id: number;
  },
) {
  if (members.length === 0) return;

  await tx.delete(users_organizations).where(
    and(
      eq(users_organizations.organization_id, organization_id),
      inArray(
        users_organizations.user_id,
        members.map(({ user_id }) => user_id),
      ),
    ),
  );

  for (const { is_external, user_id, verification_type } of members) {
    await insertActivity<ActivityContexts>(tx, {
      action: "member.removed",
      actor: { type: "app", job: "domain.remove_members" },
      app,
      cause_activity_id,
      context: { inputs: {}, outcome: { is_external, verification_type } },
      organization_id,
      user_id,
    });
  }
}

function toPreviousMembership({ user_id, verification_type }: Member) {
  return { previous_verification_type: verification_type, user_id };
}
