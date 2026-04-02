import fs from "fs/promises";
import path from "path";
import { env } from "./env";
import { StoreData } from "../types/domain";

const defaultStore: StoreData = {
  users: [],
  records: [],
  audits: []
};

class Persistence {
  private filePath = path.resolve(process.cwd(), env.dataFile);

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

    const parsed = JSON.parse(content) as StoreData;

    return {
      users: parsed.users ?? [],
      records: parsed.records ?? [],
      audits: parsed.audits ?? []
    };
  }

  async write(payload: StoreData): Promise<void> {
    await this.ensureFileExists();
    await fs.writeFile(this.filePath, JSON.stringify(payload, null, 2), "utf-8");
  }
}

export const persistence = new Persistence();
