import { preHandlerAsyncHookHandler } from "fastify";

const bodyParser: preHandlerAsyncHookHandler = async (request, reply) => {
  // Convert request.body keys to snake_case
  if (request.body && typeof request.body === "object") {
    request.body = convertKeysToSnakeCase(request.body);
  }

  // Convert query params keys to snake_case
  if (request.query && typeof request.query === "object") {
    request.query = convertKeysToSnakeCase(request.query);
  }

  // Convert params keys to snake_case
  if (request.params && typeof request.params === "object") {
    request.params = convertKeysToSnakeCase(request.params);
  }
};

// Function to convert camelCase to snake_case
function convertKeysToSnakeCase(obj: Record<string, any>): Record<string, any> {
  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToSnakeCase(item));
  }

  if (typeof obj === "object" && obj !== null) {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeCaseKey = toSnakeCase(key); // Convert camelCase to snake_case
      acc[snakeCaseKey] = convertKeysToSnakeCase(obj[key]);
      return acc;
    }, {} as Record<string, any>);
  }

  return obj; // If it's neither an object nor an array, just return the value
}

// Function to convert camelCase string to snake_case
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
}

export default bodyParser;
