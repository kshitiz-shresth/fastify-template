export function getUniqueValues<T extends Record<string, any>>(
  keys: string[],
  data: T[]
): Record<string, any[]> {
  const result: Record<string, Set<any>> = {};

  // Initialize sets for each key
  keys.forEach((key) => {
    result[key] = new Set();
  });

  // Populate sets with unique values
  data.forEach((item) => {
    keys.forEach((key) => {
      if (key in item) {
        result[key].add(item[key]);
      }
    });
  });

  // Convert sets to arrays
  return Object.fromEntries(
    Object.entries(result).map(([key, value]) => [key, Array.from(value)])
  );
}
