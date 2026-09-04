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
      in
      {
        devShells.default = pkgs.mkShell {
          # matches "engines.node" in package.json (^24.11.0); npm ships with nodejs
          packages = [
            pkgs.nodejs_24
            pkgs.cypress
          ];

          # npm's downloaded Cypress binary can't dynamically link on NixOS;
          # run nixpkgs' Cypress instead. Version tracks nixpkgs-unstable, not
          # package.json's pinned "cypress" range — recheck on cypress major bumps.
          #
          # CYPRESS_SKIP_VERIFY: the store path is read-only, and Cypress'
          # verify step tries to write binary_state.json next to the binary
          # (cypress-io/cypress#30684) — skip it, npm's cypress CLI still runs.
          shellHook = ''
            export CYPRESS_INSTALL_BINARY=0
            export CYPRESS_RUN_BINARY="${pkgs.cypress}/bin/Cypress"
            export CYPRESS_SKIP_VERIFY=true
          '';
        };
      }
    );
}
