//

import { moderations } from "@proconnect-gouv/proconnect.identite.database/drizzle";
import {
  createIdentiteRuntime,
  type IdentiteDatabase,
} from "@proconnect-gouv/proconnect.identite.runtime";
import { eq } from "drizzle-orm";

//

export async function cancelModerationRecord({
  db,
  moderation_id,
  organization_id,
  status,
  user_id,
}: {
  db: IdentiteDatabase;
  moderation_id: number;
  organization_id: number;
  status: string;
  user_id: number;
}): Promise<void> {
  const runtime = createIdentiteRuntime({ app: "proconnect-identite", db });

  await db.transaction(async (tx) => {
    await tx
      .update(moderations)
      .set({
        moderated_at: new Date().toISOString(),
        status: "cancelled",
      })
      .where(eq(moderations.id, moderation_id));

    await runtime.as({ type: "user", user_id }).record(tx, {
      action: "moderation.cancelled",
      context: {
        inputs: { moderation_id },
        outcome: { previous: { status } },
      },
      moderation_id,
      organization_id,
      user_id,
    });
  });
}
