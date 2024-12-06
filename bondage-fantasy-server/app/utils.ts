export function escapeRegex(text: string): string {
  return text.replace(/([.*+?=^!:${}()|[\]\/\\])/g, "\\$1");
}
