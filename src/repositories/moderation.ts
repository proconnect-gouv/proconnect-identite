import { ModerationNotFoundError } from "@gouvfr-lasuite/proconnect.identite/errors";
import type { QueryResult } from "pg";
import { getDatabaseConnection } from "../connectors/postgres";

export const createModeration = async ({
  user_id,
  organization_id,
  type,
  ticket_id,
}: {
  user_id: number;
  organization_id: number;
  type: Moderation["type"];
  ticket_id: string | null;
}) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Moderation> = await connection.query(
    `
INSERT INTO moderations (user_id, organization_id, type, ticket_id)
VALUES ($1, $2, $3, $4)
RETURNING *;`,
    [user_id, organization_id, type, ticket_id],
  );

  return rows.shift()!;
};

export const findPendingModeration = async ({
  user_id,
  organization_id,
  type,
}: {
  user_id: number;
  organization_id: number;
  type: Moderation["type"];
}) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Moderation> = await connection.query(
    `
SELECT *
FROM moderations
WHERE user_id = $1
  AND organization_id = $2
  AND type = $3
  AND moderated_at IS NULL;`,
    [user_id, organization_id, type],
  );

  return rows.shift();
};

export const findModerationById = async (id: number) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Moderation> = await connection.query(
    `
  SELECT *
  FROM moderations
  WHERE id = $1;`,
    [id],
  );

  return rows.shift();
};

export const getModerationById = async (id: number) => {
  const moderation = await findModerationById(id);
  if (!moderation)
    throw new ModerationNotFoundError(`Moderation ${id} not found`);
  return moderation;
};

export const findRejectedModeration = async ({
  user_id,
  organization_id,
  type,
}: {
  user_id: number;
  organization_id: number;
  type: Moderation["type"];
}) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Moderation> = await connection.query(
    `
SELECT *
FROM moderations
WHERE user_id = $1
  AND organization_id = $2
  AND type = $3
  AND moderated_at IS NOT NULL
  AND comment LIKE '%Rejeté par%';`,
    [user_id, organization_id, type],
  );

  return rows.shift();
};

export const deleteModeration = async (id: number) => {
  const connection = getDatabaseConnection();

  const { rowCount } = await connection.query(
    `
  DELETE FROM moderations
  WHERE id = $1;`,
    [id],
  );

  return rowCount > 0;
};

export const reopenModeration = async ({
  id,
  userEmail,
  cause,
}: {
  id: number;
  userEmail: string;
  cause: string;
}) => {
  const connection = getDatabaseConnection();

  const { rows }: QueryResult<Moderation> = await connection.query(
    `
UPDATE moderations
SET moderated_at = NULL,
    moderated_by = NULL,
    comment = COALESCE(comment, '') || ' | Réouvert le ' || NOW()::date || ' par ' || $2 || ' - ' || $3
WHERE id = $1
RETURNING *;`,
    [id, userEmail, cause],
  );

  return rows.shift();
};
