//

import { Buffer } from "node:buffer";
import * as z from "zod";
import { Domain } from "./domain.js";

//

/*
 * specifications of these schemas can be found at
 * https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#email-address-validation
 */
const addressSchema = z
  .email({ pattern: z.regexes.rfc5322Email })
  .refine((email) => Buffer.byteLength(email) <= 254, "email over 254 bytes")
  .refine(
    (email) => Buffer.byteLength(email.slice(0, email.lastIndexOf("@"))) <= 63,
    "local part over 63 bytes",
  )
  .check((ctx) => {
    const domain = Domain.nameSchema.safeParse(
      ctx.value.slice(ctx.value.lastIndexOf("@") + 1),
    );
    if (!domain.success) {
      ctx.issues.push({
        code: "custom",
        input: ctx.value,
        message: "invalid domain",
        params: { cause: domain.error },
      });
    }
  });

const schema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(addressSchema)
  .brand<"Email">();

export const Email = {
  isValid: (email: unknown): email is string =>
    addressSchema.safeParse(email).success,
  parse: schema.parse,
  safeParse: schema.safeParse,
  schema,
};

export type Email = z.output<typeof schema>;
