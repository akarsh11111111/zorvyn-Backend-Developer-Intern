export type Role = "viewer" | "analyst" | "admin";

export type RecordType = "income" | "expense";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialRecord {
  id: string;
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  isDeleted: boolean;
}

export interface AuditEvent {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: Role;
  action: string;
  entityType: "user" | "record" | "auth" | "system";
  entityId: string;
  timestamp: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface StoreData {
  users: User[];
  records: FinancialRecord[];
  audits: AuditEvent[];
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}
