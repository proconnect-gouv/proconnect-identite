import { setupServer } from "msw/node";
import { entrepriseHandlers } from "./entreprise.api.gouv.fr";
import {
  FranceconnectFrontChannel,
  franceconnectHandlers,
} from "./oidc.franceconnect.gouv.fr";

console.log("[🎭] Opening to mockery theater");

const frontChannelServer = FranceconnectFrontChannel.listen(8600);

const server = setupServer(...entrepriseHandlers, ...franceconnectHandlers);

server.events.on("request:start", ({ request }) => {
  console.log(`[🎭] <- ${request.method} ${request.url}`);
});

server.events.on("request:end", ({ request }) => {
  console.log(`[🎭] -> ${request.method} ${request.url}`);
});

server.listen();

// Cleanup function to stop both servers
export function cleanup() {
  console.log("[🎭] Closing the theater");
  server.close();
  frontChannelServer.close();
}
