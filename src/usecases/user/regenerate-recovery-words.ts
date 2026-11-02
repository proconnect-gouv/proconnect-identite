//

import { recovery_words } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  createIdentiteRuntime,
  type IdentiteDatabase,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { eq } from "drizzle-orm";

//

export async function regenerateRecoveryWords({
  db,
  hashed_words,
  user_id,
}: {
  db: IdentiteDatabase;
  hashed_words: string;
  user_id: number;
}): Promise<void> {
  const runtime = createIdentiteRuntime({ app: "proconnect-identite", db });

  await db.transaction(async (tx) => {
    const [previous] = await tx
      .select({ user_id: recovery_words.user_id })
      .from(recovery_words)
      .where(eq(recovery_words.user_id, user_id))
      .for("update");

    await tx
      .delete(recovery_words)
      .where(eq(recovery_words.user_id, user_id));

    await tx.insert(recovery_words).values({ hashed_words, user_id });

    await runtime.as({ type: "user", user_id }).record(tx, {
      action: "user.recovery_words_regenerated",
      context: {
        inputs: {},
        outcome: {
          previous: { recovery_words_configured: previous !== undefined },
        },
      },
      user_id,
    });
  });
}
