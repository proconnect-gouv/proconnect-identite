import crypto from "crypto";
import { HTTP_CLIENT_TIMEOUT } from "../config/env";
import { logger } from "../services/log";
import { request } from "./request";

const apiResponseParser = (rawData: string): { [k: string]: number } => {
  return rawData
    .split("\n")
    .reduce((acc: { [k: string]: number }, cur: string) => {
      const hash = cur.split(":")[0];
      const count = parseInt(cur.split(":")[1], 10);
      acc[hash] = count;
      return acc;
    }, {});
};

export const hasPasswordBeenPwned = async (
  plainPassword: string,
): Promise<boolean> => {
  const shasum = crypto.createHash("sha1");
  shasum.update(plainPassword);
  const sha1Hash = shasum.digest("hex").toUpperCase();
  const hashFirst5Chars = sha1Hash.substring(0, 5);
  const hashTrailingChars = sha1Hash.substring(5);

  try {
    const { data } = await request<string>(
      `https://api.pwnedpasswords.com/range/${hashFirst5Chars}`,
      {
        method: "get",
        headers: {
          "Add-Padding": "true",
        },
        timeout: HTTP_CLIENT_TIMEOUT,
      },
    );

    const parsedData = apiResponseParser(data);

    return parsedData[hashTrailingChars] > 10;
  } catch (error) {
    logger.error(error);

    throw new Error("Error from pwnedpasswords API");
  }
};
