/**
 * @description This function takes two objects,
 * options and defaults, and returns a new object
 * with the default values applied to the options object.
 * If a key exists in both objects, the value from
 * the options object is used. If the value is an object,
 * the function is called recursively to apply the defaults
 * to the nested object.
 */
export declare function applyDefaults<T extends Record<string, any>>(options: Partial<T>, defaults: T): T;
/**
 * @description This function converts a string to
 * kebab case by replacing all uppercase letters with a
 * hyphen followed by the lowercase version of the letter.
 */
export declare function kebabCase(str: string): string;
