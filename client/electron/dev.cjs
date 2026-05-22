const http = require("http");
const { spawn } = require("child_process");

const useShell = process.platform === "win32";
const electronBin = require("electron");
const expoPort = process.env.ORDOVITA_EXPO_PORT || "8081";
const expoUrl = `http://127.0.0.1:${expoPort}`;

function waitForExpo() {
  return new Promise((resolve) => {
    const startedAt = Date.now();

    const check = () => {
      const request = http.get(expoUrl, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", () => {
        if (Date.now() - startedAt > 120000) {
          console.error("Expo Web did not start within 120 seconds.");
          process.exit(1);
        }
        setTimeout(check, 1000);
      });

      request.setTimeout(2000, () => {
        request.destroy();
      });
    };

    check();
  });
}

const expo = spawn("npx", ["expo", "start", "--web", "--port", expoPort], {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: useShell,
  env: {
    ...process.env,
    BROWSER: "none",
    EXPO_PUBLIC_API_URL: "",
  },
});

let electron = null;

function shutdown() {
  if (electron && !electron.killed) electron.kill();
  if (!expo.killed) expo.kill();
}

process.on("SIGINT", () => {
  shutdown();
  process.exit(0);
});

process.on("SIGTERM", () => {
  shutdown();
  process.exit(0);
});

expo.on("exit", (code) => {
  if (code !== 0 && electron && !electron.killed) electron.kill();
});

waitForExpo().then(() => {
  electron = spawn(electronBin, ["."], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...process.env,
      EXPO_PUBLIC_API_URL: "",
      ORDOVITA_ELECTRON_RENDERER_URL: expoUrl,
    },
  });

  electron.on("exit", (code) => {
    shutdown();
    process.exit(code || 0);
  });
});
