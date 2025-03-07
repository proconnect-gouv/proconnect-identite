//

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isNameValid } from "./is-name-valid.js";

//

describe("isNameValid", () => {
  const invalidNames = [
    "jean@domaine.fr",
    "dsi_etudes_applications",
    "R2 - Sebastien",
    "0000",
    "CCTV70",
    "0623456789",
    ";GOUZE",
    "Agathe/Carine",
    `<script>alert("hello")</script>`,
    "SG/PAFF/DDTM06",
    "Jean*Robert",
    "Jose_luis",
    "MME.",
    "Sabrina.b",
    "M.Christine",
    "Bousbecque59098*",
    "vAL2RIE",
    "Ch.",
    "YOANNI TH.",
    "M. le Président",
  ];

  invalidNames.forEach((invalidName) => {
    it(`should return false for invalid names: ${invalidName}`, () => {
      assert.equal(isNameValid(invalidName), false);
    });
  });

  const validNames = [
    "Jean",
    "Jean-Jean",
    "TAREK      WAJDI",
    "  Tania",
    "Надежда",
    "沃德天·",
    "อาทิตย์ นาถมทอง",
    "俊宇",
    "Doğan",
    "Hanåğğne",
    "سليمان خالد",
    "marcn     bh",
    "THỊ PHƯƠNG HỒNG",
    "Yamina⁵",
  ];

  validNames.forEach((validName) => {
    it(`should return true for valid names: ${validName}`, () => {
      assert.equal(isNameValid(validName), true);
    });
  });
});
