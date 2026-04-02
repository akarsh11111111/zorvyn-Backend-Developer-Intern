interface CachedResponse {
  statusCode: number;
  body: unknown;
}

interface IdempotencyEntry {
  requestHash: string;
  expiresAt: number;
  response: CachedResponse;
}

export class IdempotencyService {
  private readonly store = new Map<string, IdempotencyEntry>();

  get(key: string): IdempotencyEntry | undefined {
    const entry = this.store.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry;
  }

  set(key: string, requestHash: string, response: CachedResponse, ttlMs: number): void {
    this.store.set(key, {
      requestHash,
      response,
      expiresAt: Date.now() + ttlMs
    });
  }
}

export const idempotencyService = new IdempotencyService();