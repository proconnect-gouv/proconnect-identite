import { franceconnectConnected } from "./franceconnect";
import { moderationOpened } from "./moderation";
import { organizationUpserted } from "./organization";
import { userInfoChanged, userPasswordChanged } from "./profile";

export const identiteProcedures = {
  franceconnect: { connected: franceconnectConnected },
  moderation: { opened: moderationOpened },
  organization: { upserted: organizationUpserted },
  user: {
    info_changed: userInfoChanged,
    password_changed: userPasswordChanged,
  },
};
