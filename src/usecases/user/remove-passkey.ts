//

import { authenticators } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  createIdentiteRuntime,
  type IdentiteDatabase,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { and, eq } from "drizzle-orm";

//

export async function removePasskey({
  credential_id,
  db,
  user_id,
}: {
  credential_id: string;
  db: IdentiteDatabase;
  user_id: number;
}): Promise<boolean> {
  const runtime = createIdentiteRuntime({ app: "proconnect-identite", db });

  return db.transaction(async (tx) => {
    const deleted = await tx
      .delete(authenticators)
      .where(
        and(
          eq(authenticators.user_id, user_id),
          eq(authenticators.credential_id, credential_id),
        ),
      )
      .returning({ credential_id: authenticators.credential_id });

    if (deleted.length === 0) {
      return false;
    }

    await runtime.as({ type: "user", user_id }).record(tx, {
      action: "user.passkey_removed",
      context: { inputs: { credential_id }, outcome: {} },
      user_id,
    });

    return true;
  });
}
