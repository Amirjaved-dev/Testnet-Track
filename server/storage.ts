import { users, type User, type InsertUser } from "@shared/schema";
import { getDbClient } from "./db";
import * as bcrypt from "bcrypt";
import { log } from "./vite";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  isAdmin?(userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    
    // Add demo admin user
    this.createUser({
      username: "admin",
      password: "admin123"
    }).then(user => {
      log("Added demo admin user to in-memory storage", "storage");
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export class DbStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const client = await getDbClient();
      if (!client) return undefined;

      const result = await client.query(
        'SELECT * FROM users WHERE id = $1 LIMIT 1',
        [id]
      );

      if (result.rows.length === 0) return undefined;

      const row = result.rows[0];
      return {
        id: row.id,
        username: row.username,
        password: row.password,
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const client = await getDbClient();
      if (!client) return undefined;

      const result = await client.query(
        'SELECT * FROM users WHERE username = $1 LIMIT 1',
        [username]
      );

      if (result.rows.length === 0) return undefined;

      const row = result.rows[0];
      return {
        id: row.id,
        username: row.username,
        password: row.password,
      };
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const client = await getDbClient();
      if (!client) {
        throw new Error('Cannot connect to database');
      }

      const hashedPassword = await bcrypt.hash(insertUser.password, 10);

      const result = await client.query(
        'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
        [insertUser.username, hashedPassword]
      );

      const id = result.rows[0].id;
      return {
        id,
        username: insertUser.username,
        password: hashedPassword,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async isAdmin(userId: number): Promise<boolean> {
    try {
      const client = await getDbClient();
      if (!client) return false;

      const result = await client.query(
        'SELECT * FROM admin_users WHERE user_id = $1 LIMIT 1',
        [userId]
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
}

// Try to use database storage, fall back to memory storage if DB connection fails
let dbClient: any = null;

export async function initStorage(): Promise<IStorage> {
  try {
    dbClient = await getDbClient();
    if (dbClient) {
      log("Using database storage", "storage");
      return new DbStorage();
    } else {
      log("Database connection failed, using in-memory storage", "storage");
      return new MemStorage();
    }
  } catch (error) {
    console.error("Error initializing storage:", error);
    log("Error in storage initialization, using in-memory storage", "storage");
    return new MemStorage();
  }
}

// Initially use memory storage, will be replaced after init
export let storage: IStorage = new MemStorage();
