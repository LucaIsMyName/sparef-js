// src/utils.ts

export function applyDefaults<T extends Record<string, any>>(options: Partial<T>, defaults: T): T {
  const result = { ...defaults };
  for (const key in options) {
    if (Object.prototype.hasOwnProperty.call(options, key)) {
      const value = options[key];
      if (typeof value === 'object' && value !== null && key in result) {
        result[key] = applyDefaults(
          value as Partial<T[Extract<keyof T, string>]>,
          result[key] as T[Extract<keyof T, string>]
        );
      } else {
        result[key] = value as T[Extract<keyof T, string>];
      }
    }
  }
  return result;
}

export function kebabCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}