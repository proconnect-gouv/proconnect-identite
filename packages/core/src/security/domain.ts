//

import { parse_host } from "tld-extract";
import * as z from "zod";

//

/*
 * specifications of these schemas can be found at
 * https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html#email-address-validation
 */
const nameSchema = z
  .string()
  .regex(/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/)
  .check((ctx) => {
    try {
      parse_host(ctx.value, { allowDotlessTLD: true });
    } catch (cause) {
      ctx.issues.push({
        code: "custom",
        input: ctx.value,
        message: "unknown TLD",
        params: { cause },
      });
    }
  });

const schema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(nameSchema)
  .brand<"Domain">();

export const Domain = {
  isValid: (domain: unknown): domain is string =>
    nameSchema.safeParse(domain).success,
  nameSchema,
  parse: schema.parse,
  safeParse: schema.safeParse,
  schema,
};

export type Domain = z.output<typeof schema>;
