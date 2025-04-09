type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamel<U>>}`
  : S;
type ConvertSnakeToCamel<T> = T extends Array<infer U>
  ? Array<ConvertSnakeToCamel<U>>
  : T extends object
  ? {
      [K in keyof T as SnakeToCamel<string & K>]: ConvertSnakeToCamel<T[K]>;
    }
  : T;
export function snakeToCamelCase<T>(obj: T): ConvertSnakeToCamel<T> {
  if (Array.isArray(obj)) {
    // Recursively process each item in the array
    return obj.map((item) => snakeToCamelCase(item)) as ConvertSnakeToCamel<T>;
  } else if (obj && typeof obj === "object" && obj !== null) {
    // Process objects, keeping values as-is
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()), // Convert key to camelCase
        value, // Keep the value unchanged
      ])
    ) as ConvertSnakeToCamel<T>;
  }
  // Return primitive values directly
  return obj as ConvertSnakeToCamel<T>;
}
type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? T extends Lowercase<T>
    ? `${T}${CamelToSnake<U>}`
    : `_${Lowercase<T>}${CamelToSnake<U>}`
  : S;

type ConvertCamelToSnake<T> = T extends Array<infer U>
  ? Array<ConvertCamelToSnake<U>>
  : T extends object
  ? {
      [K in keyof T as CamelToSnake<string & K>]: ConvertCamelToSnake<T[K]>;
    }
  : T;

export function camelToSnakeCase<T>(obj: T): ConvertCamelToSnake<T> {
  if (Array.isArray(obj)) {
    // Recursively process each item in the array
    return obj.map((item) => camelToSnakeCase(item)) as ConvertCamelToSnake<T>;
  } else if (obj && typeof obj === "object" && obj !== null) {
    // Process objects, keeping values as-is
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/([A-Z])/g, "_$1").toLowerCase(), // Convert key to snake_case
        value, // Keep the value unchanged
      ])
    ) as ConvertCamelToSnake<T>;
  }
  // Return primitive values directly
  return obj as ConvertCamelToSnake<T>;
}
