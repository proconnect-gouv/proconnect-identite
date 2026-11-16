import { franceconnectConnected } from "./franceconnect";
import { moderationCancelled, moderationOpened } from "./moderation";
import { userInfoChanged, userPasswordChanged } from "./profile";

export const identiteProcedures = {
  franceconnect: { connected: franceconnectConnected },
  moderation: { cancelled: moderationCancelled, opened: moderationOpened },
  user: {
    info_changed: userInfoChanged,
    password_changed: userPasswordChanged,
  },
};
