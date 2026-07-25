export function resolveSettingsValue<T>(value: T | undefined, fallback: T): T {
  return value !== undefined && value !== null ? value : fallback;
}

export function pickModuleSettings<T extends object>(
  settings: Record<string, unknown> | undefined,
  defaults: T
): T {
  const source = settings ?? {};
  const result = { ...defaults };

  for (const key of Object.keys(defaults) as Array<keyof T & string>) {
    const value = source[key];
    if (value !== undefined && value !== null) {
      (result as Record<string, unknown>)[key] = value;
    }
  }

  return result;
}
