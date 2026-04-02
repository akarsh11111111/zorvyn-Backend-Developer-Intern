import fs from "fs/promises";
import { mkdirSync } from "fs";
import path from "path";
import Database from "better-sqlite3";
import { env } from "./env";
import { StoreData } from "../types/domain";

const defaultStore: StoreData = {
  users: [],
  records: [],
  audits: []
};

function normalizeStoreData(payload: Partial<StoreData> | null | undefined): StoreData {
  return {
    users: payload?.users ?? [],
    records: payload?.records ?? [],
    audits: payload?.audits ?? []
  };
}

interface PersistenceDriver {
  read(): Promise<StoreData>;
  write(payload: StoreData): Promise<void>;
}

class JsonFileDriver implements PersistenceDriver {
  private readonly filePath = path.resolve(process.cwd(), env.dataFile);

  private async ensureFileExists(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(defaultStore, null, 2), "utf-8");
    }
  }

  async read(): Promise<StoreData> {
    await this.ensureFileExists();
    const content = await fs.readFile(this.filePath, "utf-8");

    if (!content.trim()) {
      return defaultStore;
    }

    const parsed = JSON.parse(content) as Partial<StoreData>;
    return normalizeStoreData(parsed);
  }

  async write(payload: StoreData): Promise<void> {
    await this.ensureFileExists();
    await fs.writeFile(this.filePath, JSON.stringify(payload, null, 2), "utf-8");
  }
}

class SqliteDriver implements PersistenceDriver {
  private readonly sqliteFilePath = path.resolve(process.cwd(), env.sqliteFile);
  private readonly bootstrapJsonPath = path.resolve(process.cwd(), env.dataFile);
  private db?: Database.Database;

  private getOrCreateDb(): Database.Database {
    if (this.db) {
      return this.db;
    }

    const dir = path.dirname(this.sqliteFilePath);
    mkdirSync(dir, { recursive: true });

    const db = new Database(this.sqliteFilePath);
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");

    db.prepare(
      `
      CREATE TABLE IF NOT EXISTS app_store (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
      `
    ).run();

    this.db = db;
    return db;
  }

  private async readBootstrapJsonIfAvailable(): Promise<StoreData | null> {
    try {
      const content = await fs.readFile(this.bootstrapJsonPath, "utf-8");
      if (!content.trim()) {
        return null;
      }

      const parsed = JSON.parse(content) as Partial<StoreData>;
      return normalizeStoreData(parsed);
    } catch {
      return null;
    }
  }

  private async ensureSeeded(): Promise<void> {
    const db = this.getOrCreateDb();
    const row = db.prepare("SELECT payload FROM app_store WHERE id = 1").get() as { payload: string } | undefined;

    if (row) {
      return;
    }

    const bootstrapPayload = (await this.readBootstrapJsonIfAvailable()) ?? defaultStore;

    db.prepare("INSERT INTO app_store (id, payload, updated_at) VALUES (1, ?, ?)").run(
      JSON.stringify(bootstrapPayload),
      new Date().toISOString()
    );
  }

  async read(): Promise<StoreData> {
    await this.ensureSeeded();
    const db = this.getOrCreateDb();

    const row = db.prepare("SELECT payload FROM app_store WHERE id = 1").get() as { payload: string } | undefined;

    if (!row) {
      return defaultStore;
    }

    const parsed = JSON.parse(row.payload) as Partial<StoreData>;
    return normalizeStoreData(parsed);
  }

  async write(payload: StoreData): Promise<void> {
    await this.ensureSeeded();
    const db = this.getOrCreateDb();

    db.prepare("UPDATE app_store SET payload = ?, updated_at = ? WHERE id = 1").run(
      JSON.stringify(payload),
      new Date().toISOString()
    );
  }
}

class Persistence {
  private readonly driver: PersistenceDriver;

  constructor() {
    this.driver = env.persistenceMode.toLowerCase() === "json" ? new JsonFileDriver() : new SqliteDriver();
  }

  async read(): Promise<StoreData> {
    return this.driver.read();
  }

  async write(payload: StoreData): Promise<void> {
    await this.driver.write(payload);
  }
}

export const persistence = new Persistence();
