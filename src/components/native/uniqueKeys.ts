/**
 * Native lazy lists throw on a repeated key, and a list can hold the same song twice (a JioSaavn
 * playlist, or a playlist saved before adding skipped duplicates). Later repeats get a stable
 * `:n` suffix.
 */
export function uniqueKeys(keys: readonly string[]): string[] {
  const seen = new Map<string, number>();
  return keys.map((key) => {
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    return count === 0 ? key : `${key}:${count}`;
  });
}
