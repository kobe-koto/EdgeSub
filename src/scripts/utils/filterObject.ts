/**
 * Generic “object filter”.  Works exactly like Array.filter,
 * but the callback receives (key, value) instead of (value, index).
 *
 * @param obj        The source object.
 * @param predicate  (key, value) => boolean – return true to keep the entry.
 *
 * @returns a new object typed as a *partial* of the original (because we
 *          don't know at compile time which keys survive).
 */
export default function filterObject <T extends object> (
  obj: T,
  predicate: (key: keyof T, value: T[keyof T]) => boolean
): Partial<T> {
  const result: Partial<T> = {};

  // `Object.keys` returns string[], so we cast it to the proper key type.
  const keys = Object.keys(obj) as (keyof T)[];

  for (const k of keys) {
    const v = obj[k];
    if (predicate(k, v)) {
      // This cast is safe – we only ever assign a known property.
      (result as any)[k] = v;
    }
  }

  return result;
}
