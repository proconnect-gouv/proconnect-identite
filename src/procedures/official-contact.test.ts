import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { given, userActivity } from "../../testing";
import { officialContactCodeSent } from "./official-contact";

const procedures = { official_contact: { code_sent: officialContactCodeSent } };

describe("official_contact.code_sent", () => {
  it("✅ stores the code and journals each mailbox it was sent to", async () => {
    const { db, journal, runtime } = await given({ procedures });
    await db.insert(schema.organizations).values({
      created_at: "4444-04-04",
      id: 7,
      siret: "11111111111111",
      updated_at: "4444-04-04",
    });

    await runtime.official_contact.code_sent.mutate({
      contact_email: "mairie@commune.fr",
      organization_id: 7,
      token: "pomme poire",
      user_id: 1,
    });
    await runtime.official_contact.code_sent.mutate({
      contact_email: "secretariat@commune.fr",
      organization_id: 7,
      token: "cerise fraise",
      user_id: 1,
    });

    const verifications = await db
      .select({ token: schema.official_contact_email_verifications.token })
      .from(schema.official_contact_email_verifications);
    assert.deepEqual(verifications, [{ token: "cerise fraise" }]);
    assert.deepEqual(await journal(), [
      userActivity(
        "official_contact.code_sent",
        { inputs: {}, outcome: { contact_email: "mairie@commune.fr" } },
        { organization_id: 7 },
      ),
      userActivity(
        "official_contact.code_sent",
        { inputs: {}, outcome: { contact_email: "secretariat@commune.fr" } },
        { organization_id: 7 },
      ),
    ]);
  });
});
