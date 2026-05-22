const { spawnSync } = require("child_process");

const useShell = process.platform === "win32";
const mode = process.argv.includes("--nsis") ? "nsis" : "dir";

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

run("npx", ["expo", "export", "--platform", "web"], {
  ...process.env,
  EXPO_PUBLIC_API_URL: "",
});

if (mode === "nsis") {
  run("npx", ["electron-builder", "--win", "nsis"]);
} else {
  run("npx", ["electron-builder", "--win", "--dir"]);
}
