import fs from "fs";
import path from "path";

const DB_FILE_PATH = path.join(process.cwd(), "data", "db.json");

interface LocalDbInterface {
  find: (collection: string, filter?: Record<string, any>) => Promise<any[]>;
  findOne: (collection: string, filter?: Record<string, any>) => Promise<any | null>;
  create: (collection: string, data: Record<string, any>) => Promise<any>;
  findByIdAndUpdate: (collection: string, id: string | number, updates: Record<string, any>) => Promise<any | null>;
  findByIdAndDelete: (collection: string, id: string | number) => Promise<boolean>;
  reset: () => Promise<boolean>;
}

function readDb(): Record<string, any[]> {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const initial = {
        users: [],
        tickets: [],
        workflows: [],
        projects: [],
        tasks: [],
        employees: [],
        notifications: []
      };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
    return JSON.parse(content || "{}");
  } catch (err) {
    console.error("Failed to read local db.json:", err);
    return {};
  }
}

function writeDb(data: Record<string, any[]>): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to local db.json:", err);
  }
}

function matchesFilter(item: any, filter: Record<string, any>): boolean {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (key === "$or" && Array.isArray(val)) {
      const anyMatch = val.some(subFilter => matchesFilter(item, subFilter));
      if (!anyMatch) return false;
      continue;
    }

    if (key === "id" || key === "_id") {
      const itemId = String(item.id || item._id || "");
      const filterId = String(val);
      if (itemId !== filterId) return false;
      continue;
    }

    if (item[key] !== val) {
      return false;
    }
  }

  return true;
}

export const localDb: LocalDbInterface = {
  find: async (collection: string, filter: Record<string, any> = {}) => {
    const db = readDb();
    const list = db[collection] || [];
    return list.filter(item => matchesFilter(item, filter));
  },

  findOne: async (collection: string, filter: Record<string, any> = {}) => {
    const db = readDb();
    const list = db[collection] || [];
    const found = list.find(item => matchesFilter(item, filter));
    return found || null;
  },

  create: async (collection: string, data: Record<string, any>) => {
    const db = readDb();
    if (!db[collection]) {
      db[collection] = [];
    }

    const generatedId = data.id || data._id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newRecord = {
      id: generatedId,
      _id: generatedId,
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db[collection].unshift(newRecord);
    writeDb(db);
    return newRecord;
  },

  findByIdAndUpdate: async (collection: string, id: string | number, updates: Record<string, any>) => {
    const db = readDb();
    const list = db[collection] || [];
    const strId = String(id);
    const index = list.findIndex(item => String(item.id) === strId || String(item._id) === strId);

    if (index === -1) return null;

    const cleanUpdates = { ...updates };
    delete cleanUpdates.id;
    delete cleanUpdates._id;

    const updatedItem = {
      ...list[index],
      ...cleanUpdates,
      updatedAt: new Date().toISOString()
    };

    list[index] = updatedItem;
    db[collection] = list;
    writeDb(db);
    return updatedItem;
  },

  findByIdAndDelete: async (collection: string, id: string | number) => {
    const db = readDb();
    const list = db[collection] || [];
    const strId = String(id);
    const initialLen = list.length;
    const filtered = list.filter(item => String(item.id) !== strId && String(item._id) !== strId);

    if (filtered.length === initialLen) return false;

    db[collection] = filtered;
    writeDb(db);
    return true;
  },

  reset: async () => {
    const initial = {
      users: [],
      tickets: [],
      workflows: [],
      projects: [],
      tasks: [],
      employees: [],
      notifications: []
    };
    writeDb(initial);
    return true;
  }
};