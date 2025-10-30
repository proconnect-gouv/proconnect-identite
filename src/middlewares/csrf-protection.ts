import { csrfSync } from "csrf-sync";
import type { Request } from "express";

const { generateToken, csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req: Request) => {
    return req.body?._csrf;
  },
});

export const csrfProtectionMiddleware = csrfSynchronisedProtection;

// Csrf tokens are new for each requests
export const csrfToken = (req: Request) => generateToken(req);
