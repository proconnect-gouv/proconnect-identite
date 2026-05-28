//

import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import { convert } from "html-to-text";
import { isArray, isString } from "lodash-es";
import { createTransport, type SendMailOptions } from "nodemailer";
import {
  DEPLOY_ENV,
  SMTP_FROM,
  SMTP_FROM_ALT,
  SMTP_FROM_ALT_RATIO_PERCENT,
  SMTP_URL,
  USE_SMTP_FROM_ALT_FOR_DOMAINS,
} from "../config/env";

//

const transporter = createTransport({
  url: SMTP_URL,
});

//

interface SendMailBrevoOptions extends Omit<SendMailOptions, "from"> {
  tag?: string;
}
export function sendMail(options: SendMailBrevoOptions) {
  const tag = options.tag ? [{ key: "X-Mailin-Tag", value: options.tag }] : [];
  const subject = computeMailSubject(options.subject);

  const toEmail = isArray(options?.to) ? options?.to[0] : options?.to;
  let useAltFrom = false;

  if (isString(toEmail)) {
    const toDomain = getEmailDomain(toEmail);

    useAltFrom =
      USE_SMTP_FROM_ALT_FOR_DOMAINS.includes(toDomain) ||
      // We use length + modulo for reproducibility when we want to debug users.
      // We also use length + modulo for testability, so the same test case always returns the same result.
      // We use the length of the email for simplicity: the length is easy to compute and can be calculated by hand.
      // We use a percentage for the sake of readability: it is easier to manipulate a percentage than a modulo from an external perspective.
      toEmail.length % 10 < (SMTP_FROM_ALT_RATIO_PERCENT / 100) * 10;
  }

  return transporter.sendMail({
    text:
      typeof options.html === "string" ? convert(options.html) : options.text,
    headers: [...tag],
    ...options,
    subject,
    from: {
      name: "ProConnect",
      address: useAltFrom ? SMTP_FROM_ALT : SMTP_FROM,
    },
  });
}

function computeMailSubject(
  initialSubject: SendMailBrevoOptions["subject"],
): SendMailBrevoOptions["subject"] {
  if (initialSubject === undefined) {
    return undefined;
  }

  if (DEPLOY_ENV === "sandbox") {
    return `Test - ${initialSubject}`;
  }

  return initialSubject;
}
