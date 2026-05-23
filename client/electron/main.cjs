const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const { URL } = require("url");
const { app, BrowserWindow, Menu, ipcMain, session, shell } = require("electron");

const PROTOCOL = "aitaskmanager";
const DEFAULT_BACKEND_ORIGIN = "https://ordovita.pl";

let mainWindow = null;
let localServer = null;
let localServerUrl = null;
let pendingDeepLinkUrl = null;

function normalizeOrigin(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return DEFAULT_BACKEND_ORIGIN;
  return trimmed.replace(/\/+$/, "");
}

const backendOrigin = normalizeOrigin(
  process.env.ORDOVITA_DESKTOP_API_URL || process.env.EXPO_PUBLIC_API_URL,
);

const devRendererOrigin = process.env.ORDOVITA_ELECTRON_RENDERER_URL
  ? normalizeOrigin(process.env.ORDOVITA_ELECTRON_RENDERER_URL)
  : "";

function contentSecurityPolicy() {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${backendOrigin}`,
    "form-action 'self'",
  ].join("; ");
}

function isProxyPath(pathname) {
  return (
    pathname.startsWith("/v1/api") ||
    pathname.startsWith("/oauth2") ||
    pathname.startsWith("/login/oauth2")
  );
}

function rewriteSetCookieHeader(cookie) {
  return cookie
    .split(";")
    .map((part) => part.trim())
    .filter((part) => {
      const lower = part.toLowerCase();
      return lower !== "secure" && !lower.startsWith("domain=");
    })
    .join("; ");
}

function copyProxyHeaders(proxyResponse) {
  const headers = { ...proxyResponse.headers };
  const setCookie = headers["set-cookie"];

  if (Array.isArray(setCookie)) {
    headers["set-cookie"] = setCookie.map(rewriteSetCookieHeader);
  } else if (typeof setCookie === "string") {
    headers["set-cookie"] = rewriteSetCookieHeader(setCookie);
  }

  return headers;
}

function proxyRequest(request, response, targetOrigin) {
  const requestUrl = new URL(request.url || "/", targetOrigin);
  const transport = requestUrl.protocol === "https:" ? https : http;
  const headers = { ...request.headers };

  headers.host = requestUrl.host;
  delete headers.origin;
  delete headers.referer;

  const proxy = transport.request(
    {
      protocol: requestUrl.protocol,
      hostname: requestUrl.hostname,
      port: requestUrl.port,
      method: request.method,
      path: `${requestUrl.pathname}${requestUrl.search}`,
      headers,
    },
    (proxyResponse) => {
      response.writeHead(
        proxyResponse.statusCode || 502,
        copyProxyHeaders(proxyResponse),
      );
      proxyResponse.pipe(response);
    },
  );

  proxy.on("error", (error) => {
    response.writeHead(502, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        message: "Desktop proxy could not reach backend",
        detail: error.message,
      }),
    );
  });

  request.pipe(proxy);
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
  };
  return types[ext] || "application/octet-stream";
}

function serveStatic(request, response) {
  const distDir = path.resolve(__dirname, "..", "dist");
  const indexFile = path.join(distDir, "index.html");
  const requestUrl = new URL(request.url || "/", "http://localhost");
  const decodedPath = decodeURIComponent(requestUrl.pathname);
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.slice(1);
  let filePath = path.resolve(distDir, relativePath);

  if (!filePath.startsWith(distDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = indexFile;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeType(filePath),
      "Cache-Control":
        filePath === indexFile ? "no-cache" : "public, max-age=31536000",
      "Content-Security-Policy": contentSecurityPolicy(),
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    });
    response.end(content);
  });
}

function startLocalServer() {
  return new Promise((resolve, reject) => {
    localServer = http.createServer((request, response) => {
      const requestUrl = new URL(request.url || "/", "http://localhost");

      if (isProxyPath(requestUrl.pathname)) {
        proxyRequest(request, response, backendOrigin);
        return;
      }

      if (!app.isPackaged && devRendererOrigin) {
        proxyRequest(request, response, devRendererOrigin);
        return;
      }

      serveStatic(request, response);
    });

    localServer.on("error", reject);
    localServer.listen(
      Number(process.env.ORDOVITA_DESKTOP_PORT || 0),
      "127.0.0.1",
      () => {
        const address = localServer.address();
        localServerUrl = `http://127.0.0.1:${address.port}`;
        resolve(localServerUrl);
      },
    );
  });
}

function registerProtocol() {
  if (process.defaultApp) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
    return;
  }

  app.setAsDefaultProtocolClient(PROTOCOL);
}

function findDeepLink(argv) {
  return argv.find((arg) => arg.startsWith(`${PROTOCOL}://`));
}

function toLocalCallbackUrl(deepLink) {
  const url = new URL(deepLink);
  const callbackPath =
    url.hostname === "oauth-callback" ? "/oauth-callback" : url.pathname;
  return `${localServerUrl}${callbackPath || "/oauth-callback"}${url.search}`;
}

function handleDeepLink(deepLink) {
  if (!localServerUrl) {
    pendingDeepLinkUrl = deepLink;
    return;
  }

  if (!mainWindow) {
    pendingDeepLinkUrl = deepLink;
    createMainWindow();
    return;
  }

  mainWindow.show();
  mainWindow.focus();
  mainWindow.loadURL(toLocalCallbackUrl(deepLink));
}

function isAllowedLocalUrl(rawUrl) {
  if (!localServerUrl) return false;

  try {
    return new URL(rawUrl).origin === new URL(localServerUrl).origin;
  } catch {
    return false;
  }
}

function isAllowedExternalUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" && url.origin === backendOrigin;
  } catch {
    return false;
  }
}

function configureWindowSecurity(window) {
  window.webContents.on("will-navigate", (event, navigationUrl) => {
    if (!isAllowedLocalUrl(navigationUrl)) {
      event.preventDefault();
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedExternalUrl(url)) {
      shell.openExternal(url);
    }

    return { action: "deny" };
  });
}

function configureSessionSecurity() {
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, _permission, callback) => {
      callback(false);
    },
  );
}

function configureApplicationMenu() {
  if (process.platform !== "darwin") {
    Menu.setApplicationMenu(null);
    return;
  }

  const menu = Menu.buildFromTemplate([
    {
      label: "Ordovita",
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
  ]);

  Menu.setApplicationMenu(menu);
}

function closeLocalServer() {
  if (localServer) {
    localServer.close();
    localServer = null;
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 680,
    title: "Ordovita",
    backgroundColor: "#fbf8ff",
    autoHideMenuBar: process.platform !== "darwin",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (process.platform !== "darwin") {
    mainWindow.setMenuBarVisibility(false);
  }

  configureWindowSecurity(mainWindow);

  const initialUrl = pendingDeepLinkUrl
    ? toLocalCallbackUrl(pendingDeepLinkUrl)
    : localServerUrl;

  pendingDeepLinkUrl = null;
  mainWindow.loadURL(initialUrl);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

ipcMain.handle("desktop:open-oauth", async () => {
  const oauthUrl = new URL("/oauth2/authorization/google", backendOrigin);
  oauthUrl.searchParams.set("client", "desktop");
  await shell.openExternal(oauthUrl.toString());
  return true;
});

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    const deepLink = findDeepLink(argv);
    if (deepLink) handleDeepLink(deepLink);
  });

  app.on("open-url", (event, url) => {
    event.preventDefault();
    handleDeepLink(url);
  });

  app.whenReady().then(async () => {
    configureApplicationMenu();
    configureSessionSecurity();
    registerProtocol();
    await startLocalServer();

    const startupDeepLink = findDeepLink(process.argv);
    if (startupDeepLink) {
      pendingDeepLinkUrl = startupDeepLink;
    }

    createMainWindow();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && localServerUrl) {
      createMainWindow();
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      closeLocalServer();
      app.quit();
    }
  });

  app.on("before-quit", () => {
    closeLocalServer();
  });
}
