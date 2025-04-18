/** OpenAI require this format: ^[a-zA-Z0-9_-]+$ */
export function getToolName(displayName: string) {
  return displayName.replace(/[^a-zA-Z0-9_-]/g, "_");
}
