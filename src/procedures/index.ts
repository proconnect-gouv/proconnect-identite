import { franceconnectConnected } from "./franceconnect";
import {
  moderationCancelled,
  moderationOpened,
  moderationReopened,
} from "./moderation";
import { officialContactCodeSent } from "./official-contact";
import { userInfoChanged, userPasswordChanged } from "./profile";

export const identiteProcedures = {
  franceconnect: { connected: franceconnectConnected },
  moderation: {
    cancelled: moderationCancelled,
    opened: moderationOpened,
    reopened: moderationReopened,
  },
  official_contact: { code_sent: officialContactCodeSent },
  user: {
    info_changed: userInfoChanged,
    password_changed: userPasswordChanged,
  },
};
