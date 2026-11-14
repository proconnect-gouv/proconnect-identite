import { franceconnectConnected } from "./franceconnect";
import { moderationOpened } from "./moderation";
import { userInfoChanged, userPasswordChanged } from "./profile";
import {
  userAccountRecovered,
  userForce2faDisabled,
  userForce2faEnabled,
  userPasskeyAdded,
  userPasskeyRemoved,
  userRecoveryWordsRegenerated,
  userTotpAdded,
  userTotpRemoved,
} from "./second-factor";

export const identiteProcedures = {
  franceconnect: { connected: franceconnectConnected },
  moderation: { opened: moderationOpened },
  user: {
    account_recovered: userAccountRecovered,
    force_2fa_disabled: userForce2faDisabled,
    force_2fa_enabled: userForce2faEnabled,
    info_changed: userInfoChanged,
    passkey_added: userPasskeyAdded,
    passkey_removed: userPasskeyRemoved,
    password_changed: userPasswordChanged,
    recovery_words_regenerated: userRecoveryWordsRegenerated,
    totp_added: userTotpAdded,
    totp_removed: userTotpRemoved,
  },
};
