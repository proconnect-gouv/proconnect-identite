//

import { getEmailDomain } from "@proconnect-gouv/proconnect.core/services/email";
import { convert } from "html-to-text";
import { isArray, isString } from "lodash-es";
import { createTransport, type SendMailOptions } from "nodemailer";
import {
  DEPLOY_ENV,
  SMTP_FROM,
  SMTP_FROM_ALT,
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

    useAltFrom = USE_SMTP_FROM_ALT_FOR_DOMAINS.includes(toDomain);
  }

  return transporter.sendMail({
    text:
      typeof options.html === "string" ? convert(options.html) : options.text,
    headers: [...tag],
    ...options,
    subject,
    from: useAltFrom ? SMTP_FROM_ALT : SMTP_FROM,
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
