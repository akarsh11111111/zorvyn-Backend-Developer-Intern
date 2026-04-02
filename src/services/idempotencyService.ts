interface CachedResponse {
  statusCode: number;
  body: unknown;
}

interface IdempotencyCompletedEntry {
  state: "completed";
  requestHash: string;
  expiresAt: number;
  response: CachedResponse;
}

interface IdempotencyPendingEntry {
  state: "pending";
  requestHash: string;
  expiresAt: number;
}

type IdempotencyEntry = IdempotencyCompletedEntry | IdempotencyPendingEntry;

export type IdempotencyDecision =
  | { type: "created" }
  | { type: "replay"; response: CachedResponse }
  | { type: "conflict" }
  | { type: "in_progress" };

export class IdempotencyService {
  private readonly store = new Map<string, IdempotencyEntry>();

  private get(key: string): IdempotencyEntry | undefined {
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

  begin(key: string, requestHash: string, ttlMs: number): IdempotencyDecision {
    const existing = this.get(key);

    if (!existing) {
      this.store.set(key, {
        state: "pending",
        requestHash,
        expiresAt: Date.now() + ttlMs
      });

      return { type: "created" };
    }

    if (existing.requestHash !== requestHash) {
      return { type: "conflict" };
    }

    if (existing.state === "pending") {
      return { type: "in_progress" };
    }

    return { type: "replay", response: existing.response };
  }

  complete(key: string, requestHash: string, response: CachedResponse, ttlMs: number): void {
    const existing = this.get(key);

    if (!existing || existing.requestHash !== requestHash) {
      return;
    }

    this.store.set(key, {
      state: "completed",
      requestHash,
      response,
      expiresAt: Date.now() + ttlMs
    });
  }

  release(key: string, requestHash: string): void {
    const existing = this.get(key);

    if (!existing || existing.requestHash !== requestHash) {
      return;
    }

    this.store.delete(key);
  }
}

export const idempotencyService = new IdempotencyService();