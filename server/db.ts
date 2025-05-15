import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '@shared/schema';
import { log } from './vite';

// Get database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

// Create a PostgreSQL client
let client: Client | null = null;
let hasAttemptedConnection = false;

export async function getDbClient(): Promise<Client | null> {
  if (client) return client;
  if (hasAttemptedConnection) return null;
  
  hasAttemptedConnection = true;
  
  if (!databaseUrl) {
    log('DATABASE_URL environment variable is not set', 'db');
    return null;
  }
  
  try {
    client = new Client({
      connectionString: databaseUrl,
    });
    
    await client.connect();
    log('Connected to PostgreSQL database', 'db');
    return client;
  } catch (error) {
    console.error('Failed to connect to PostgreSQL database:', error);
    client = null;
    return null;
  }
}

export async function getDb() {
  const client = await getDbClient();
  if (!client) return null;
  
  return drizzle(client, { schema });
}

// Initialize the database tables
export async function initDb() {
  try {
    const client = await getDbClient();
    if (!client) {
      log('Cannot initialize database - no connection', 'db');
      return false;
    }
    
    // Create tables
    log('Creating database tables...', 'db');
    
    // users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // admin_users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // app_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'string',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // advertisements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS advertisements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        placement TEXT NOT NULL,
        image_url TEXT,
        target_url TEXT,
        is_active BOOLEAN DEFAULT true,
        start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        end_date TIMESTAMP WITH TIME ZONE,
        created_by TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Check if admin user exists
    const adminResult = await client.query(`
      SELECT * FROM users WHERE username = 'admin' LIMIT 1;
    `);
    
    // Create default admin user if none exists
    if (adminResult.rows.length === 0) {
      log('Creating default admin user...', 'db');
      
      // Insert admin user
      const userResult = await client.query(`
        INSERT INTO users (username, email, password)
        VALUES ('admin', 'admin@demo.com', '$2b$10$NnTfuzO1yGe/lLRHYt.xPOZwDUvzNPdqgVJuXQDQJV1p6U5QbhjMu')
        RETURNING id;
      `);
      
      const userId = userResult.rows[0].id;
      
      // Add admin user to admin_users table
      await client.query(`
        INSERT INTO admin_users (user_id)
        VALUES ($1);
      `, [userId]);
      
      log('Default admin user created', 'db');
    } else {
      log('Admin user already exists', 'db');
    }
    
    log('Database initialized successfully', 'db');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}