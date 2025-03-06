export const DEFAULT_DEBOUNCE = 300;
export const DEFAULT_TOOLTIP_DELAY = 500;
export const DEFAULT_TOOLTIP_TRANSITION_DURATION = 300;

export function formatBytes(bytes: number): string {
  return `${bytes / 1024} KB`;
}

export function parseCommaSeparatedNumbers(value: string): number[] {
  return value
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value !== "")
    .map((value) => parseInt(value));
}
