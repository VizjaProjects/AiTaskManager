const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const useShell = process.platform === "win32";
const args = process.argv.slice(2);
const isMac = args.includes("--mac");
const mode = args.includes("--nsis") ? "nsis" : args.includes("--dmg") ? "dmg" : "dir";
const arch = args.includes("--arm64") ? "arm64" : args.includes("--x64") ? "x64" : null;
const desktopPngIconPath = path.resolve("assets", "favicon-desktop.png");

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

function prepareDesktopPngIcon() {
  const sourceIcon = path.resolve("assets", "favicon.png");
  if (!fs.existsSync(sourceIcon)) {
    console.error("Missing source icon: assets/favicon.png");
    process.exit(1);
  }

  const { PNG } = require("pngjs");
  const source = PNG.sync.read(fs.readFileSync(sourceIcon));
  const targetSize = 1024;
  const target = new PNG({ width: targetSize, height: targetSize });

  for (let y = 0; y < targetSize; y += 1) {
    const sourceY = Math.floor((y * source.height) / targetSize);

    for (let x = 0; x < targetSize; x += 1) {
      const sourceX = Math.floor((x * source.width) / targetSize);
      const sourceIndex = (source.width * sourceY + sourceX) << 2;
      const targetIndex = (targetSize * y + x) << 2;

      target.data[targetIndex] = source.data[sourceIndex];
      target.data[targetIndex + 1] = source.data[sourceIndex + 1];
      target.data[targetIndex + 2] = source.data[sourceIndex + 2];
      target.data[targetIndex + 3] = source.data[sourceIndex + 3];
    }
  }

  fs.writeFileSync(desktopPngIconPath, PNG.sync.write(target));
}

function prepareMacIcon() {
  if (!isMac) return;

  const iconPath = path.resolve("assets", "favicon.icns");
  if (fs.existsSync(iconPath)) return;

  if (process.platform !== "darwin") {
    console.error("macOS icon generation requires macOS tools: sips and iconutil.");
    process.exit(1);
  }

  const sourceIcon = desktopPngIconPath;
  if (!fs.existsSync(sourceIcon)) {
    console.error("Missing generated desktop icon: assets/favicon-desktop.png");
    process.exit(1);
  }

  const iconsetDir = path.resolve("assets", "favicon.iconset");
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

prepareDesktopPngIcon();
prepareMacIcon();

if (isMac) {
  const builderArgs = ["electron-builder", "--mac"];
  if (mode === "dmg") {
    builderArgs.push("dmg");
  } else {
    builderArgs.push("--dir");
  }
  if (arch) builderArgs.push(`--${arch}`);
  run("npx", builderArgs);
} else if (mode === "nsis") {
  run("npx", ["electron-builder", "--win", "nsis"]);
} else {
  run("npx", ["electron-builder", "--win", "--dir"]);
}
