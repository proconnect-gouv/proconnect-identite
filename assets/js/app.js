import "@gouvfr/dsfr/dist/core/core.module";
import "@gouvfr/dsfr/dist/component/navigation/navigation.module";
import "@gouvfr/dsfr/dist/component/modal/modal.module";
import "@gouvfr/dsfr/dist/component/header/header.module";
import { disableFormsOnSubmit } from "./modules/disable-on-submit";
import "./modules/load-bar";
import {
  announceNotifications,
  explainExternalLinks,
  improveFakeButtons,
} from "./modules/screen-reader";

document.addEventListener("DOMContentLoaded", () => {
  announceNotifications();
  explainExternalLinks();
  improveFakeButtons();
  disableFormsOnSubmit();
});
