declare global {
  interface Window {
    goatcounter?: {
      count: (opts: { path: string; title?: string; event?: boolean }) => void;
    };
  }
}

export function trackEvent(path: string): void {
  window.goatcounter?.count({
    path,
    title: path,
    event: true,
  });
}
