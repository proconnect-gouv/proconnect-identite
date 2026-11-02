//

import { authenticators } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  createIdentiteRuntime,
  type IdentiteDatabase,
} from "@proconnect-gouv/proconnect.identite.runtime";

//

export async function addPasskey({
  authenticator,
  db,
  user_id,
}: {
  authenticator: Omit<
    typeof authenticators.$inferInsert,
    "created_at" | "user_id"
  >;
  db: IdentiteDatabase;
  user_id: number;
}): Promise<void> {
  const runtime = createIdentiteRuntime({ app: "proconnect-identite", db });

  await db.transaction(async (tx) => {
    await tx.insert(authenticators).values({ ...authenticator, user_id });

    await runtime.as({ type: "user", user_id }).record(tx, {
      action: "user.passkey_added",
      context: {
        inputs: { display_name: authenticator.display_name ?? null },
        outcome: { credential_id: authenticator.credential_id },
      },
      user_id,
    });
  });
}
