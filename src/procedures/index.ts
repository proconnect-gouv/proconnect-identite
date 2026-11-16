import { franceconnectConnected } from "./franceconnect";
import {
  moderationCancelled,
  moderationOpened,
  moderationReopened,
} from "./moderation";
import { userInfoChanged, userPasswordChanged } from "./profile";

export const identiteProcedures = {
  franceconnect: { connected: franceconnectConnected },
  moderation: {
    cancelled: moderationCancelled,
    opened: moderationOpened,
    reopened: moderationReopened,
  },
  user: {
    info_changed: userInfoChanged,
    password_changed: userPasswordChanged,
  },
};
