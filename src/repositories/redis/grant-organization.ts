import { z } from "zod";
import { getNewRedisClient } from "../../connectors/redis";

//

const keyFor = (grantId: string) => `pci:grant-organization:${grantId}`;

const GrantOrganizationSchema = z.object({
  organizationId: z.number().int(),
  acr: z.string().optional(),
});

export type GrantOrganization = z.infer<typeof GrantOrganizationSchema>;

export const setGrantOrganization = async (
  grantId: string,
  grantOrganization: GrantOrganization,
  ttlInSeconds: number,
) => {
  await getNewRedisClient().set(
    keyFor(grantId),
    JSON.stringify(grantOrganization),
    { EX: ttlInSeconds },
  );
};

export const getGrantOrganization = async (
  grantId: string,
): Promise<GrantOrganization | undefined> => {
  const value = await getNewRedisClient().get(keyFor(grantId));
  if (value === null) return undefined;
  return GrantOrganizationSchema.parse(JSON.parse(value));
};
