{
  description = "ProConnect Identité flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    inputs:
    inputs.flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = inputs.nixpkgs.legacyPackages.${system};
        lib = pkgs.lib;

        # Node.js major from "engines.node" in package.json ("^24.11.0" -> nodejs_24).
        nodeMajor = lib.head (
          lib.splitString "." (lib.removePrefix "^" (lib.importJSON ./package.json).engines.node)
        );
        nodejs = pkgs."nodejs_${nodeMajor}";

        # Libraries the Cypress (Electron) binary links against or dlopens.
        cypressLibs = with pkgs; [
          alsa-lib
          at-spi2-atk
          cairo
          cups
          dbus
          expat
          gdk-pixbuf
          glib
          gtk3
          libdrm
          libgbm
          libGL
          libnotify
          libx11
          libxcb
          libxcomposite
          libxcursor
          libxdamage
          libxext
          libxfixes
          libxi
          libxkbcommon
          libxrandr
          libxrender
          libxscrnsaver
          libxshmfence
          libxtst
          nspr
          nss
          pango
          systemd
        ];

        # npm downloads the Cypress binary matching package-lock.json into the
        # Cypress cache, as on any other OS. NixOS can't run that generic
        # Linux binary, so patch its interpreter and RPATH in place.
        # Idempotent: already patched files are skipped.
        cypressPatchelf = pkgs.writeShellScriptBin "cypress-patchelf" ''
          set -eu
          version=$(node -p 'require("cypress/package.json").version' 2>/dev/null) || exit 0
          dir="''${CYPRESS_CACHE_FOLDER:-$HOME/.cache/Cypress}/$version"
          [ -x "$dir/Cypress/Cypress" ] || exit 0
          case "$(${pkgs.patchelf}/bin/patchelf --print-interpreter "$dir/Cypress/Cypress")" in
            /nix/store/*) exit 0 ;;
          esac
          echo "cypress-patchelf: patching $dir" >&2
          ${pkgs.auto-patchelf}/bin/auto-patchelf --ignore-missing='*' \
            --paths "$dir" \
            --libs ${lib.concatMapStringsSep " " (p: "${lib.getLib p}/lib") cypressLibs} \
            --runtime-dependencies ${
              lib.concatMapStringsSep " " (p: "${lib.getLib p}/lib") cypressLibs
            } >/dev/null
        '';
      in
      {
        devShells.default = pkgs.mkShell {
          packages = [
            nodejs
            cypressPatchelf
            # Xvfb, for headless `cypress run`
            pkgs.xorg-server
          ];
          # covers an existing install; run `cypress-patchelf` after `npm ci`
          shellHook = "cypress-patchelf";
        };
      }
    );
}
