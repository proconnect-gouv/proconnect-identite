var _paq = (window._paq = window._paq || []);
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push([
  "setExcludedQueryParams",
  [
    "login_hint",
    "reset_password_token",
    "id_token_hint",
    "siret_hint",
    "_se",
    "referer",
    "state",
    "did_you_mean",
    "magic_link_token",
    "moderation_id",
    "user_id",
    "organization_id",
    "simulationId",
    "_csrf",
  ],
]);
_paq.push(["trackPageView"]);
_paq.push(["enableLinkTracking"]);
(function () {
  var u = "https://stats.data.gouv.fr/";
  _paq.push(["setTrackerUrl", u + "matomo.php"]);
  _paq.push(["setSiteId", "85"]);
  var d = document,
    g = d.createElement("script"),
    s = d.getElementsByTagName("script")[0];
  g.async = true;
  g.src = u + "matomo.js";
  s.parentNode.insertBefore(g, s);
})();
