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

        # pin to match "cypress" in package.json exactly — nixpkgs-unstable's
        # cypress drifts from it otherwise. Bump both together.
        cypress = pkgs.cypress.overrideAttrs (old: rec {
          version = "15.15.0";
          src = pkgs.fetchurl {
            url = "https://cdn.cypress.io/desktop/${version}/linux-x64/cypress.zip";
            hash = "sha256-ekFa9RO8vCcSEhlHWHw7/uwILmfSS4oyFiJWU4kWlQc=";
          };
        });
      in
      {
        devShells.default = pkgs.mkShell {
          # matches "engines.node" in package.json (^24.11.0); npm ships with nodejs
          packages = [
            pkgs.nodejs_24
            cypress
          ];

          # npm's downloaded Cypress binary can't dynamically link on NixOS;
          # run nixpkgs' (version-pinned, see above) Cypress instead.
          #
          # CYPRESS_SKIP_VERIFY: the store path is read-only, and Cypress'
          # verify step tries to write binary_state.json next to the binary
          # (cypress-io/cypress#30684) — skip it, npm's cypress CLI still runs.
          shellHook = ''
            export CYPRESS_INSTALL_BINARY=0
            export CYPRESS_RUN_BINARY="${cypress}/bin/Cypress"
            export CYPRESS_SKIP_VERIFY=true
          '';
        };
      }
    );
}
