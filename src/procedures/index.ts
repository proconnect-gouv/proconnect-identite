import { franceconnectConnected } from "./franceconnect";
import { moderationOpened } from "./moderation";
import { userInfoChanged, userPasswordChanged } from "./profile";

export const identiteProcedures = {
  franceconnect: { connected: franceconnectConnected },
  moderation: { opened: moderationOpened },
  user: {
    info_changed: userInfoChanged,
    password_changed: userPasswordChanged,
  },
};
