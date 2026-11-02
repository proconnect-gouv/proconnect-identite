//

import type { ActivityContexts, RuntimeContext } from "#src/activity";
import { insertActivity } from "#src/journal";
import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { User } from "@proconnect-gouv/proconnect.identite/types";
import { eq, sql } from "drizzle-orm";

//

type PersonalInformation = Pick<
  User,
  "family_name" | "given_name" | "job" | "phone_number"
>;

type UpdatePersonalInformationsOutcome =
  | {
      kind: "info_changed";
      activity_id: number;
      next: PersonalInformation;
      previous: PersonalInformation;
    }
  | { kind: "info_unchanged"; user_id: number }
  | { kind: "user_not_found"; user_id: number };

export function updatePersonalInformationsFactory({
  actor,
  app,
  db,
}: RuntimeContext) {
  return function updatePersonalInformations({
    information,
    user_id,
  }: {
    information: Partial<
      Pick<User, "family_name" | "given_name" | "job" | "phone_number">
    >;
    user_id: number;
  }): Promise<UpdatePersonalInformationsOutcome> {
    return db.transaction(async (tx) => {
      const [previous] = await tx
        .select({
          family_name: users.family_name,
          given_name: users.given_name,
          job: users.job,
          phone_number: users.phone_number,
        })
        .from(users)
        .where(eq(users.id, user_id))
        .for("update");

      if (!previous) {
        return { kind: "user_not_found", user_id };
      }

      const next = {
        family_name:
          information.family_name !== undefined
            ? information.family_name
            : previous.family_name,
        given_name:
          information.given_name !== undefined
            ? information.given_name
            : previous.given_name,
        job: information.job !== undefined ? information.job : previous.job,
        phone_number:
          information.phone_number !== undefined
            ? information.phone_number
            : previous.phone_number,
      };

      if (
        next.family_name === previous.family_name &&
        next.given_name === previous.given_name &&
        next.job === previous.job &&
        next.phone_number === previous.phone_number
      ) {
        return { kind: "info_unchanged", user_id };
      }

      await tx
        .update(users)
        .set({ ...next, updated_at: sql`now()` })
        .where(eq(users.id, user_id));

      const { activity_id } = await insertActivity<ActivityContexts>(tx, {
        action: "user.info_changed",
        actor,
        app,
        context: { inputs: next, outcome: { previous } },
        user_id,
      });

      return { kind: "info_changed", activity_id, next, previous };
    });
  };
}
