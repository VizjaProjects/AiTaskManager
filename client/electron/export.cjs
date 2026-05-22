const { spawnSync } = require("child_process");

const useShell = process.platform === "win32";

const result = spawnSync("npx", ["expo", "export", "--platform", "web"], {
  stdio: "inherit",
  shell: useShell,
  env: {
    ...process.env,
    EXPO_PUBLIC_API_URL: "",
  },
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
