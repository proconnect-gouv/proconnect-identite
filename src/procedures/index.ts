import {
  certificationDirigeantCertified,
  certificationDirigeantCloseMatched,
  certificationDirigeantNotCovered,
  certificationDirigeantNotMatched,
} from "./certification";
import { franceconnectConnected } from "./franceconnect";
import {
  moderationCancelled,
  moderationOpened,
  moderationReopened,
} from "./moderation";
import { officialContactCodeSent } from "./official-contact";
import { userInfoChanged, userPasswordChanged } from "./profile";

export const identiteProcedures = {
  certification_dirigeant: {
    certified: certificationDirigeantCertified,
    close_matched: certificationDirigeantCloseMatched,
    not_covered: certificationDirigeantNotCovered,
    not_matched: certificationDirigeantNotMatched,
  },
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
