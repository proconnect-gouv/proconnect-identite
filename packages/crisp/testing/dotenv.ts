//

import dotenv from "dotenv";

//

dotenv.config({
  path: [
    `.env.${process.env["NODE_ENV"] ?? "development"}.local`,
    ".env.local",
    `.env.${process.env["NODE_ENV"] ?? "development"}`,
    ".env",
  ],
});
