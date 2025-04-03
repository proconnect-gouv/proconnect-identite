//

import { z } from "zod";

//

export const CertificationSessionSchema = z.object({
  certificationDirigeantRequested: z.boolean().default(false),
  passCertificationPage: z.boolean().default(false),
});

export type CertificationSession = z.output<typeof CertificationSessionSchema>;
