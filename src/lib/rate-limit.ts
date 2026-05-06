type Entry = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, Entry>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }

  if (existing.count >= max) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  memoryStore.set(key, existing);
  return { ok: true, remaining: Math.max(0, max - existing.count) };
}
