/**
 * Recursively converts non-serializable Prisma types to plain JS values
 * so they can be safely passed from Server Components to Client Components.
 *
 * - Decimal → number  (duck-typed via .toNumber())
 * - Date    → kept as-is (Next.js handles Date serialization natively)
 * - null / primitives → kept as-is
 * - Arrays and plain objects → traversed recursively
 *
 * The return type is kept as `T` so callers retain their existing type information.
 * In practice, Decimal fields become plain numbers at runtime — compatible with
 * the rest of the codebase which treats prices as numbers in formatPrice() etc.
 */
export function serialize<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  // Duck-type check for Prisma Decimal: has .toNumber() method.
  // Avoids importing Prisma's internal runtime types.
  if (
    typeof data === "object" &&
    !(data instanceof Date) &&
    !Array.isArray(data) &&
    typeof (data as Record<string, unknown>).toNumber === "function"
  ) {
    return ((data as Record<string, unknown>).toNumber as () => unknown)() as T;
  }

  if (Array.isArray(data)) {
    return data.map(serialize) as unknown as T;
  }

  if (typeof data === "object" && !(data instanceof Date)) {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([key, value]) => [
        key,
        serialize(value),
      ])
    ) as T;
  }

  return data;
}
