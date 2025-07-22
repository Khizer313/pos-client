import Fuse from "fuse.js";
import { useMemo } from "react";

export type FuseSearchOptions<T> = {
  data: T[];
  keys: (keyof T)[];
  searchTerm: string;
  threshold?: number;
};

export function useFuseSearch<T>({
  data,
  keys,
  searchTerm,
  threshold = 0.3,
}: FuseSearchOptions<T>): T[] {
  const results = useMemo(() => {
    if (!searchTerm || !data.length) return data;

    const fuse = new Fuse(data, {
      keys: keys as string[],
      threshold,
    });

    return fuse.search(searchTerm).map((result) => result.item);
  }, [data, keys, searchTerm, threshold]);

  return results;
}
