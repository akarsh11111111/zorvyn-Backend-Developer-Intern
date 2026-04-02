import crypto from "crypto";
import { persistence } from "../config/persistence";
import { FinancialRecord, RecordType } from "../types/domain";
import { ApiError } from "../utils/apiError";

interface CreateRecordInput {
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes?: string;
  createdBy: string;
}

interface UpdateRecordInput {
  amount?: number;
  type?: RecordType;
  category?: string;
  date?: string;
  notes?: string;
  expectedVersion?: number;
}

interface RecordFilters {
  type?: RecordType;
  category?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export class RecordService {
  async createRecord(input: CreateRecordInput): Promise<FinancialRecord> {
    const store = await persistence.read();
    const now = new Date().toISOString();

    const record: FinancialRecord = {
      id: crypto.randomUUID(),
      amount: input.amount,
      type: input.type,
      category: input.category,
      date: input.date,
      notes: input.notes,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
      version: 1,
      isDeleted: false
    };

    store.records.push(record);
    await persistence.write(store);

    return record;
  }

  async getRecordById(id: string): Promise<FinancialRecord> {
    const store = await persistence.read();
    const record = store.records.find((item) => item.id === id && !item.isDeleted);

    if (!record) {
      throw new ApiError(404, "Record not found");
    }

    return record;
  }

  async listRecords(filters: RecordFilters) {
    const store = await persistence.read();
    let items = store.records.filter((record) => !record.isDeleted);

    if (filters.type) {
      items = items.filter((record) => record.type === filters.type);
    }

    if (filters.category) {
      items = items.filter((record) => record.category.toLowerCase() === filters.category?.toLowerCase());
    }

    if (filters.fromDate) {
      const from = new Date(filters.fromDate);
      items = items.filter((record) => new Date(record.date) >= from);
    }

    if (filters.toDate) {
      const to = new Date(filters.toDate);
      items = items.filter((record) => new Date(record.date) <= to);
    }

    items = items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);

    return {
      data: paginated,
      meta: {
        total: items.length,
        page,
        limit,
        totalPages: Math.ceil(items.length / limit)
      }
    };
  }

  async updateRecord(id: string, input: UpdateRecordInput): Promise<FinancialRecord> {
    const store = await persistence.read();
    const record = store.records.find((item) => item.id === id && !item.isDeleted);

    if (!record) {
      throw new ApiError(404, "Record not found");
    }

    if (record.version === undefined || record.version < 1) {
      record.version = 1;
    }

    if (input.expectedVersion !== undefined && input.expectedVersion !== record.version) {
      throw new ApiError(409, "Record version conflict. Refresh and retry with latest version.");
    }

    if (input.amount !== undefined) record.amount = input.amount;
    if (input.type !== undefined) record.type = input.type;
    if (input.category !== undefined) record.category = input.category;
    if (input.date !== undefined) record.date = input.date;
    if (input.notes !== undefined) record.notes = input.notes;

    record.updatedAt = new Date().toISOString();
    record.version += 1;

    await persistence.write(store);

    return record;
  }

  async deleteRecord(id: string): Promise<void> {
    const store = await persistence.read();
    const record = store.records.find((item) => item.id === id && !item.isDeleted);

    if (!record) {
      throw new ApiError(404, "Record not found");
    }

    if (record.version === undefined || record.version < 1) {
      record.version = 1;
    }

    record.isDeleted = true;
    record.updatedAt = new Date().toISOString();
    record.version += 1;

    await persistence.write(store);
  }
}

export const recordService = new RecordService();
