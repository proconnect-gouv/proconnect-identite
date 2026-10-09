import { SESSION_MAX_AGE_IN_SECONDS } from "../../config/env";
import { getNewRedisClient } from "../../connectors/redis";

const keyFor = (userId: number) => `mcp:selected-organization:${userId}`;

export const getSelectedOrganizationId = async (userId: number) => {
  const rawResult = await getNewRedisClient().get(keyFor(userId));
  const id = parseInt(rawResult ?? "", 10);
  return Number.isNaN(id) ? null : id;
};

export const setSelectedOrganizationId = async (
  user_id: number,
  selectedOrganization: number,
) => {
  await getNewRedisClient().setEx(
    keyFor(user_id),
    SESSION_MAX_AGE_IN_SECONDS,
    selectedOrganization.toString(),
  );
};

export const deleteSelectedOrganizationId = async (user_id: number) => {
  await getNewRedisClient().del(keyFor(user_id));
};
