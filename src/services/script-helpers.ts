// from https://ipirozhenko.com/blog/measuring-requests-duration-nodejs-express/
import type { OrganizationInfo } from "@proconnect-gouv/proconnect.identite/types";
import fs from "fs";
import { isEmpty } from "lodash-es";

export const startDurationMesure = () => {
  return process.hrtime();
};

export const getDurationInMilliseconds = (start: [number, number]) => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);

  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

export const throttleApiCall = async (
  start: [number, number],
  maxCallRateInMs: number,
) => {
  const durationInMilliseconds = getDurationInMilliseconds(start);
  const waitTimeInMilliseconds = Math.max(
    maxCallRateInMs - durationInMilliseconds,
    0,
  );
  await new Promise((resolve) => setTimeout(resolve, waitTimeInMilliseconds));
};

// from https://stackoverflow.com/questions/19700283/how-to-convert-time-in-milliseconds-to-hours-min-sec-format-in-javascript
export const humanReadableDuration = (msDuration: number) => {
  const h = Math.floor(msDuration / 1000 / 60 / 60);
  const m = Math.floor((msDuration / 1000 / 60 / 60 - h) * 60);
  const s = Math.floor(((msDuration / 1000 / 60 / 60 - h) * 60 - m) * 60);

  // To get time format 00:00:00
  const seconds = s < 10 ? `0${s}` : `${s}`;
  const minutes = m < 10 ? `0${m}` : `${m}`;
  const hours = h < 10 ? `0${h}` : `${h}`;

  return `${hours}h ${minutes}m ${seconds}s`;
};

export const getNumberOfLineInFile = async (
  input_file: string,
): Promise<number> => {
  let i;
  let count = 0;
  return await new Promise((resolve) => {
    fs.createReadStream(input_file)
      .on("data", (chunk) => {
        for (i = 0; i < chunk.length; ++i) if (chunk[i] == 10) count++;
      })
      .on("end", () => {
        resolve(count);
      });
  });
};

export function isOrganizationInfo(
  organizationInfo: OrganizationInfo | {},
): organizationInfo is OrganizationInfo {
  return !isEmpty(organizationInfo);
}
