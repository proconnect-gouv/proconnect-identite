import Bowser from "bowser";

export const detectOs = (userAgent: string | undefined): string | undefined => {
  if (!userAgent) return undefined;
  return Bowser.parse(userAgent).os.name;
};
