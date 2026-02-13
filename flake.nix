{
  description = "Yggd dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        beam = pkgs.beam.packages.erlang_27;
      in {
        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.nodejs_20
            pkgs.pnpm
            beam.erlang
            beam.elixir_1_18
            pkgs.postgresql_17
            pkgs.git
            pkgs.glibcLocales
          ];

          shellHook = ''
            export LOCALE_ARCHIVE=${pkgs.glibcLocales}/lib/locale/locale-archive
            export PGDATA="$PWD/.pg_data"
            export PGHOST="$PGDATA"

            if [ ! -d "$PGDATA" ]; then
              initdb --no-locale --encoding=UTF8
              echo "unix_socket_directories = '$PGDATA'" >> "$PGDATA/postgresql.conf"
              pg_ctl start -l "$PGDATA/log" -s
              createuser -s postgres
            else
              pg_ctl status -s || pg_ctl start -l "$PGDATA/log" -s
            fi
          '';
        };
      });
}
