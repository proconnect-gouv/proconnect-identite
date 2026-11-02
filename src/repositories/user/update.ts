//

import { UserNotFoundError } from "@proconnect-gouv/proconnect.identite/errors";
import { users } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { User } from "@proconnect-gouv/proconnect.identite/types";
import { eq } from "drizzle-orm";
import type { DatabaseContext } from "../database";
import { with_dates } from "../dates";

//

export type BookkeepingUserUpdate = Partial<
  Pick<
    User,
    | "current_challenge"
    | "last_sign_in_at"
    | "magic_link_sent_at"
    | "magic_link_token"
    | "needs_inclusionconnect_onboarding_help"
    | "needs_inclusionconnect_welcome_page"
    | "reset_password_sent_at"
    | "reset_password_token"
    | "sign_in_count"
    | "verify_email_sent_at"
    | "verify_email_token"
  >
>;

export function updateUserFactory({ db }: DatabaseContext) {
  return async function updateUser(
    id: number,
    fieldsToUpdate: BookkeepingUserUpdate,
  ) {
    const [row] = await db
      .update(users)
      .set({
        current_challenge: fieldsToUpdate.current_challenge,
        last_sign_in_at: fieldsToUpdate.last_sign_in_at?.toISOString(),
        magic_link_sent_at: fieldsToUpdate.magic_link_sent_at?.toISOString(),
        magic_link_token: fieldsToUpdate.magic_link_token,
        needs_inclusionconnect_onboarding_help:
          fieldsToUpdate.needs_inclusionconnect_onboarding_help,
        needs_inclusionconnect_welcome_page:
          fieldsToUpdate.needs_inclusionconnect_welcome_page,
        reset_password_sent_at:
          fieldsToUpdate.reset_password_sent_at?.toISOString(),
        reset_password_token: fieldsToUpdate.reset_password_token,
        sign_in_count: fieldsToUpdate.sign_in_count,
        updated_at: new Date().toISOString(),
        verify_email_sent_at:
          fieldsToUpdate.verify_email_sent_at?.toISOString(),
        verify_email_token: fieldsToUpdate.verify_email_token,
      })
      .where(eq(users.id, id))
      .returning();

    if (!row) {
      throw new UserNotFoundError("User not found");
    }

    return with_dates(row);
  };
}
