window.$crisp = [
  [
    "set",
    "session:segments",
    [["chat", "website", "identite", window.location.host]],
  ],
];
window.CRISP_WEBSITE_ID = "d1d5816e-314a-45e4-9715-144347b1039a";

const script = document.createElement("script");
script.src = "https://client.crisp.chat/l.js";
script.async = 1;
document.getElementsByTagName("head")[0].appendChild(script);
