import crypto from "crypto";
import { persistence } from "../config/persistence";
import { AuditEvent, AuthUser } from "../types/domain";

interface LogAuditInput {
  actor: AuthUser;
  action: string;
  entityType: AuditEvent["entityType"];
  entityId: string;
  metadata?: Record<string, string | number | boolean | null>;
}

interface ListAuditFilters {
  actorId?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export class AuditService {
  async log(input: LogAuditInput): Promise<void> {
    const store = await persistence.read();
    const event: AuditEvent = {
      id: crypto.randomUUID(),
      actorId: input.actor.id,
      actorEmail: input.actor.email,
      actorRole: input.actor.role,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      timestamp: new Date().toISOString(),
      metadata: input.metadata
    };

    store.audits.push(event);
    await persistence.write(store);
  }

  async list(filters: ListAuditFilters) {
    const store = await persistence.read();
    let items = [...store.audits];

    if (filters.actorId) {
      items = items.filter((item) => item.actorId === filters.actorId);
    }

    if (filters.action) {
      const query = filters.action.toLowerCase();
      items = items.filter((item) => item.action.toLowerCase().includes(query));
    }

    if (filters.fromDate) {
      const from = new Date(filters.fromDate);
      items = items.filter((item) => new Date(item.timestamp) >= from);
    }

    if (filters.toDate) {
      const to = new Date(filters.toDate);
      items = items.filter((item) => new Date(item.timestamp) <= to);
    }

    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const start = (page - 1) * limit;

    return {
      data: items.slice(start, start + limit),
      meta: {
        total: items.length,
        page,
        limit,
        totalPages: Math.ceil(items.length / limit)
      }
    };
  }
}

export const auditService = new AuditService();