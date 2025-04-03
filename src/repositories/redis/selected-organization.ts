import { SESSION_MAX_AGE_IN_SECONDS } from "../../config/env";
import { getNewRedisClient } from "../../connectors/redis";

const getRedisClient = () =>
  getNewRedisClient({
    keyPrefix: "mcp:selected-organization:",
  });

export const getSelectedOrganizationId = async (userId: number) => {
  const rawResult = await getRedisClient().get(userId.toString());
  return rawResult === null ? null : parseInt(rawResult, 10);
};

export const setSelectedOrganizationId = async (
  user_id: number,
  selectedOrganization: number,
) => {
  await getRedisClient().setex(
    user_id.toString(),
    SESSION_MAX_AGE_IN_SECONDS,
    selectedOrganization,
  );
};

export const deleteSelectedOrganizationId = async (user_id: number) => {
  await getRedisClient().del(user_id.toString());
};
