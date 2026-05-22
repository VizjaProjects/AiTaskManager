export interface OrdovitaDesktopBridge {
  isDesktop: true;
  openOAuth: () => Promise<boolean>;
}

declare global {
  interface Window {
    ordovitaDesktop?: OrdovitaDesktopBridge;
  }
}

export function getDesktopBridge(): OrdovitaDesktopBridge | null {
  if (typeof window === "undefined") return null;
  return window.ordovitaDesktop ?? null;
}

export function isDesktopApp(): boolean {
  return getDesktopBridge()?.isDesktop === true;
}
