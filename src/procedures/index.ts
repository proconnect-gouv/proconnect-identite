import { franceconnectConnected } from "./franceconnect";
import {
  moderationCancelled,
  moderationOpened,
  moderationReopened,
} from "./moderation";
import { userInfoChanged, userPasswordChanged } from "./profile";
import { userForce2faDisabled, userForce2faEnabled } from "./second-factor";

export const identiteProcedures = {
  franceconnect: { connected: franceconnectConnected },
  moderation: {
    cancelled: moderationCancelled,
    opened: moderationOpened,
    reopened: moderationReopened,
  },
  user: {
    force_2fa_disabled: userForce2faDisabled,
    force_2fa_enabled: userForce2faEnabled,
    info_changed: userInfoChanged,
    password_changed: userPasswordChanged,
  },
};
