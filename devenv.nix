{
  pkgs,
  lib,
  config,
  inputs,
  ...
}: let
  # All shared libs Electron expects at runtime on NixOS
  electronLibs = with pkgs; [
    glib
    nss
    nspr
    dbus.lib
    atk
    at-spi2-atk
    cups.lib
    gtk3
    pango
    cairo
    xorg.libX11
    xorg.libXcomposite
    xorg.libXdamage
    xorg.libXext
    xorg.libXfixes
    xorg.libXrandr
    mesa
    libgbm
    expat
    xorg.libxcb
    libxkbcommon
    systemd
    alsa-lib
    at-spi2-core
  ];

  electron = pkgs.electron_38-bin;

  runld = pkgs.writeScriptBin "runld" ''
    LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath electronLibs}:$LD_LIBRARY_PATH "$@"
  '';
in {
  languages = {
    python.enable = true;
    javascript = {
      enable = true;
      npm.enable = true;
      npm.install.enable = true;
    };
  };

  packages = [runld electron] ++ electronLibs;

  env = {
    ELECTRON_SKIP_BINARY_DOWNLOAD = 1;
    ELECTRON_OVERRIDE_DIST_PATH = "${electron}/bin";
    ELECTRON_EXEC_PATH = "${electron}/libexec/electron/electron";
  };

  # Optional: uncomment to avoid typing `runld'
  # env.LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath electronLibs;

  enterShell = ''
    echo "dev environment ready!"
  '';
}
