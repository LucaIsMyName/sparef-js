// src/utils.ts

/**
 * @description This function takes two objects, 
 * options and defaults, and returns a new object 
 * with the default values applied to the options object. 
 * If a key exists in both objects, the value from 
 * the options object is used. If the value is an object, 
 * the function is called recursively to apply the defaults 
 * to the nested object.
 */
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

/**
 * @description This function converts a string to 
 * kebab case by replacing all uppercase letters with a 
 * hyphen followed by the lowercase version of the letter.
 */
export function kebabCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}