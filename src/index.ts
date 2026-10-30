import { Server } from "http";
import { createApp } from "./app";
import { NODE_ENV, PORT } from "./config/env";
import { logger } from "./services/log";

const app = await createApp();

let server: Server | undefined;

try {
  server = app.listen(PORT, () => {
    logger.info(`application is listening on port ${PORT}`);
    logger.info(`in ${NODE_ENV} mode`);
  });
} catch (err) {
  if (server && server.listening) server.close();
  logger.error(err);
  process.exit(1);
}
