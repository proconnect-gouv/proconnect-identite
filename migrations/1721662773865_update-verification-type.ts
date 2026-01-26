import { isEmpty } from "lodash-es";
import type { MigrationBuilder } from "node-pg-migrate";
import { parse_host } from "tld-extract";
import "../packages/core/types/tld-extract.d.ts";

export async function up(pgm: MigrationBuilder): Promise<void> {
  await pgm.db.query(`
    UPDATE users_organizations
    SET verification_type = 'domain'
    WHERE verification_type IN ('verified_email_domain', 'trackdechets_email_domain', 'official_contact_domain');
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  let i = 0;

  while (true) {
    // iterate on every users_organizations link
    const { rows: linkRows } = await pgm.db.query(
      `
        SELECT user_id,
               organization_id,
               is_external,
               verification_type,
               u.email
        FROM users_organizations
               INNER JOIN users u on u.id = user_id
        ORDER BY user_id, organization_id
        LIMIT 1 OFFSET $1`,
      [i],
    );

    if (isEmpty(linkRows)) {
      break;
    }

    let [{ user_id, organization_id, verification_type, email }] = linkRows;

    if (verification_type !== "domain") {
      i++;
      continue;
    }

    // getEmailDomain copied here
    const parts = email.split("@");
    const host = parts[parts.length - 1];
    const { sub, domain: dom } = parse_host(host, { allowDotlessTLD: true });
    const domain = [sub, dom].filter((e) => !!e).join(".");

    // get the corresponding domain
    const { rows: emailDomainRows } = await pgm.db.query(
      `
        SELECT *
        from email_domains
        WHERE organization_id = $1
          AND domain = $2`,
      [organization_id, domain],
    );

    let old_verification_type = null;
    if (emailDomainRows.length === 1) {
      const newDomainVerificationToOldLinkVerification = {
        verified: "verified_email_domain",
        external: "verified_email_domain",
        trackdechets_postal_mail: "trackdechets_email_domain",
        official_contact: "official_contact_domain",
      };

      old_verification_type =
        newDomainVerificationToOldLinkVerification[
          emailDomainRows[0]
            .verification_type as keyof typeof newDomainVerificationToOldLinkVerification
        ];
    }

    if (emailDomainRows.length !== 1 || !old_verification_type) {
      console.log(
        "Error: domain not found. Falling back to null.",
        emailDomainRows,
      );
    }

    await pgm.db.query(
      `
        UPDATE users_organizations
        SET verification_type = $3
        WHERE user_id = $1
          AND organization_id = $2`,
      [user_id, organization_id, old_verification_type],
    );
  }

  i++;
}
