const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const useShell = process.platform === "win32";
const args = process.argv.slice(2);
const isMac = args.includes("--mac");
const mode = args.includes("--nsis") ? "nsis" : args.includes("--dmg") ? "dmg" : "dir";
const arch = args.includes("--arm64") ? "arm64" : args.includes("--x64") ? "x64" : null;

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: useShell,
    env,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function prepareMacIcon() {
  if (!isMac) return;

  const iconPath = path.resolve("assets", "icon.icns");
  if (fs.existsSync(iconPath)) return;

  if (process.platform !== "darwin") {
    console.error("macOS icon generation requires macOS tools: sips and iconutil.");
    process.exit(1);
  }

  const sourceIcon = path.resolve("assets", "icon.png");
  if (!fs.existsSync(sourceIcon)) {
    console.error("Missing source icon: assets/icon.png");
    process.exit(1);
  }

  const iconsetDir = path.resolve("assets", "icon.iconset");
  fs.rmSync(iconsetDir, { recursive: true, force: true });
  fs.mkdirSync(iconsetDir, { recursive: true });

  const sizes = [
    [16, "icon_16x16.png"],
    [32, "icon_16x16@2x.png"],
    [32, "icon_32x32.png"],
    [64, "icon_32x32@2x.png"],
    [128, "icon_128x128.png"],
    [256, "icon_128x128@2x.png"],
    [256, "icon_256x256.png"],
    [512, "icon_256x256@2x.png"],
    [512, "icon_512x512.png"],
    [1024, "icon_512x512@2x.png"],
  ];

  for (const [size, fileName] of sizes) {
    run("sips", ["-z", String(size), String(size), sourceIcon, "--out", path.join(iconsetDir, fileName)]);
  }

  run("iconutil", ["-c", "icns", iconsetDir, "-o", iconPath]);
  fs.rmSync(iconsetDir, { recursive: true, force: true });
}

run("npx", ["expo", "export", "--platform", "web"], {
  ...process.env,
  EXPO_PUBLIC_API_URL: "",
});

prepareMacIcon();

if (isMac) {
  const builderArgs = ["electron-builder", "--mac"];
  if (arch) builderArgs.push(`--${arch}`);
  if (mode === "dmg") {
    builderArgs.push("dmg");
  } else {
    builderArgs.push("--dir");
  }
  run("npx", builderArgs);
} else if (mode === "nsis") {
  run("npx", ["electron-builder", "--win", "nsis"]);
} else {
  run("npx", ["electron-builder", "--win", "--dir"]);
}
