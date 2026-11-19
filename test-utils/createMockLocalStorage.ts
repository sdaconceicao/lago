/**
 * In-memory Storage stand-in for test environments that don't provide
 * `localStorage` (the DOM globals exist, but the storage global can be absent).
 * A fresh instance isolates each test without leaking keys between them.
 */
export function createMockLocalStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
  };
}
