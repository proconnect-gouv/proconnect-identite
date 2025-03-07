const { isFree } = require("is-disposable-email-domain");
const { isEmpty } = require("lodash");

const doNotValidateMail =
  process.env.FEATURE_CHECK_EMAIL_DELIVERABILITY === "False";

exports.shorthands = undefined;

exports.up = async (pgm) => {
  let i = 0;

  while (true) {
    // 1. get a organization
    const { rows: results } = await pgm.db.query(
      `
SELECT
    id,
    authorized_email_domains,
    external_authorized_email_domains,
    verified_email_domains,
    external_verified_email_domains
FROM organizations
ORDER BY id LIMIT 1 OFFSET $1`,
      [i],
    );

    if (isEmpty(results)) {
      break;
    }

    let [
      {
        id,
        authorized_email_domains,
        external_authorized_email_domains,
        verified_email_domains,
        external_verified_email_domains,
      },
    ] = results;

    authorized_email_domains = authorized_email_domains.filter(
      (d) => doNotValidateMail || !isFree(d),
    );
    external_authorized_email_domains =
      external_authorized_email_domains.filter(
        (d) => doNotValidateMail || !isFree(d),
      );
    verified_email_domains = verified_email_domains.filter(
      (d) => doNotValidateMail || !isFree(d),
    );
    external_verified_email_domains = external_verified_email_domains.filter(
      (d) => doNotValidateMail || !isFree(d),
    );

    await pgm.db.query(
      `
UPDATE organizations
SET
    authorized_email_domains = $2,
    external_authorized_email_domains = $3,
    verified_email_domains = $4,
    external_verified_email_domains = $5
WHERE id = $1`,
      [
        id,
        authorized_email_domains,
        external_authorized_email_domains,
        verified_email_domains,
        external_verified_email_domains,
      ],
    );

    i++;
  }
};

exports.down = () => {};
