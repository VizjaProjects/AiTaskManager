const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ordovitaDesktop", {
  isDesktop: true,
  openOAuth: () => ipcRenderer.invoke("desktop:open-oauth"),
});
