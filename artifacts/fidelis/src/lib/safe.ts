// lib/safe.ts
export function safeArray<T>(value: any, fallback: T[] = []): T[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.transactions)) return value.transactions;
  if (Array.isArray(value?.quotes)) return value.quotes;
  if (Array.isArray(value?.positions)) return value.positions;
  if (Array.isArray(value?.watchlist)) return value.watchlist;
  if (Array.isArray(value?.news)) return value.news;

  return fallback;
}