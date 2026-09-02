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
          ];
        };
      }
    );
}
