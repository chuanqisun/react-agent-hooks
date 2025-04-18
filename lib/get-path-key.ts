export function getPathKey(breadcrumbs: string[], name: string) {
  const prefix = breadcrumbs.join("::");
  const path = [prefix, name].filter(Boolean).join("::");

  return { prefix, path };
}
