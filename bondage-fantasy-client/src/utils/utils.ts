export const DEFAULT_DEBOUNCE = 300;
export const DEFAULT_TOOLTIP_DELAY = 500;
export const DEFAULT_TOOLTIP_TRANSITION_DURATION = 300;

export function formatBytes(bytes: number): string {
  return `${bytes / 1024} KB`;
}
