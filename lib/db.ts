import mongoose from "mongoose";
import { localDb } from "./localDb";
import User from "@/models/User";
import Ticket from "@/models/Ticket";
import Workflow from "@/models/Workflow";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Employee from "@/models/Employee";
import Notification from "@/models/Notification";
import fs from "fs";
import path from "path";

const MONGODB_URI = process.env.MONGODB_URI;
let isConnected = false;

async function seedDatabaseIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log("Database already contains user records. Skipping database seeding.");
      return;
    }

    console.log("MongoDB database is empty. Initializing seeding from data/db.json...");
    const dbJsonPath = path.join(process.cwd(), "data", "db.json");
    if (!fs.existsSync(dbJsonPath)) {
      console.warn(`Seed data file not found at ${dbJsonPath}`);
      return;
    }

    const fileContent = fs.readFileSync(dbJsonPath, "utf-8");
    const dbData = JSON.parse(fileContent);

    const seedModels: { [key: string]: any } = {
      users: User,
      tickets: Ticket,
      workflows: Workflow,
      projects: Project,
      tasks: Task,
      employees: Employee,
      notifications: Notification
    };

    for (const key of Object.keys(seedModels)) {
      const model = seedModels[key];
      const dataArray = dbData[key];
      if (model && Array.isArray(dataArray) && dataArray.length > 0) {
        const count = await model.countDocuments();
        if (count === 0) {
          console.log(`Seeding ${dataArray.length} items into collection for model: ${key}...`);
          const preparedData = dataArray.map((item: any) => {
            const preparedItem = { ...item };
            if (item.id) {
              preparedItem._id = item.id;
            }
            return preparedItem;
          });
          await model.insertMany(preparedData);
        }
      }
    }
    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Failed to seed database during connection:", error);
  }
}

export async function connectDB() {
  if (isConnected) {
    return true;
  }
  if (!MONGODB_URI) {
    console.warn("MONGODB_URI is not set. Falling back to local JSON database persistence.");
    return false;
  }
  try {
    const db = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("Connected to MongoDB successfully.");

    if (isConnected) {
      await seedDatabaseIfEmpty();
    }

    return true;
  } catch (error) {
    console.error("MongoDB connection failed, falling back to local JSON database persistence:", error);
    isConnected = false;
    return false;
  }
}

// Helper to map query filter from 'id' to handling '_id' or 'id'
function translateQuery(query: any) {
  if (!query) return query;
  const newQuery = { ...query };
  if ("id" in newQuery && !("_id" in newQuery)) {
    const idVal = newQuery.id;
    delete newQuery.id;
    newQuery.$or = [{ _id: idVal }, { id: idVal }];
  }
  return newQuery;
}

// Helper to map '_id' in returned documents to 'id'
function formatDoc(doc: any): any {
  if (!doc) return doc;
  if (Array.isArray(doc)) {
    return doc.map(formatDoc);
  }
  const newDoc = doc.toObject ? doc.toObject() : { ...doc };
  if (newDoc._id && !newDoc.id) {
    newDoc.id = String(newDoc._id);
  }
  if (newDoc.id && !newDoc._id) {
    newDoc._id = String(newDoc.id);
  }
  return newDoc;
}

// Map collection name to its localDb plural equivalent
const collectionMapping: { [key: string]: string } = {
  User: "users",
  Ticket: "tickets",
  Workflow: "workflows",
  Project: "projects",
  Task: "tasks",
  Employee: "employees",
  Notification: "notifications"
};

/**
 * Returns a database driver adapter matching either MongoDB or localDb.
 * This guarantees the exact same CRUD interface is used throughout the API controllers.
 */
export async function getCollection(modelName: string, mongooseModel: any) {
  const isMongo = await connectDB();

  if (isMongo && mongooseModel) {
    return {
      find: async (query: any = {}) => {
        const translated = translateQuery(query);
        const docs = await mongooseModel.find(translated).lean();
        return formatDoc(docs);
      },
      findOne: async (query: any = {}) => {
        const translated = translateQuery(query);
        const doc = await mongooseModel.findOne(translated).lean();
        return formatDoc(doc);
      },
      create: async (data: any) => {
        const cleanData = { ...data };
        if (cleanData.id && !cleanData._id) {
          cleanData._id = cleanData.id;
        }
        if (cleanData._id && !cleanData.id) {
          cleanData.id = cleanData._id;
        }
        const item = new mongooseModel(cleanData);
        const saved = await item.save();
        return formatDoc(saved);
      },
      findByIdAndUpdate: async (id: string | number, updates: any) => {
        const cleanUpdates = { ...updates };
        delete cleanUpdates.id;
        delete cleanUpdates._id;
        const strId = String(id);
        const doc = await mongooseModel.findOneAndUpdate(
          { $or: [{ _id: strId }, { id: strId }] },
          cleanUpdates,
          { new: true }
        ).lean();
        return formatDoc(doc);
      },
      findByIdAndDelete: async (id: string | number) => {
        const strId = String(id);
        const res = await mongooseModel.deleteOne({ $or: [{ _id: strId }, { id: strId }] });
        return res.deletedCount > 0;
      }
    };
  } else {
    const localCollection = collectionMapping[modelName] || modelName.toLowerCase() + "s";
    return {
      find: async (query: any = {}) => {
        return localDb.find(localCollection, query);
      },
      findOne: async (query: any = {}) => {
        return localDb.findOne(localCollection, query);
      },
      create: async (data: any) => {
        return localDb.create(localCollection, data);
      },
      findByIdAndUpdate: async (id: string | number, updates: any) => {
        return localDb.findByIdAndUpdate(localCollection, id, updates);
      },
      findByIdAndDelete: async (id: string | number) => {
        return localDb.findByIdAndDelete(localCollection, id);
      }
    };
  }
}