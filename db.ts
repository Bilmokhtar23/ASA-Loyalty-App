import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      university TEXT,
      student_id TEXT,
      role TEXT DEFAULT 'student', -- 'student', 'admin', 'partner'
      points_balance INTEGER DEFAULT 0,
      membership_status TEXT DEFAULT 'pending', -- 'pending', 'active', 'rejected'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Events Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      date DATETIME NOT NULL,
      location TEXT NOT NULL,
      points_reward INTEGER DEFAULT 0,
      qr_code TEXT UNIQUE, -- The secret code embedded in the QR
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Partners Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT, -- 'cafe', 'restaurant', etc.
      address TEXT,
      description TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Rewards Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      partner_id INTEGER, -- NULL if it's an association reward
      name TEXT NOT NULL,
      description TEXT,
      points_cost INTEGER NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (partner_id) REFERENCES partners(id)
    )
  `);

  // Transactions Table (History of points earned/spent)
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'event_checkin', 'purchase_earn', 'reward_redemption', 'bonus'
      points INTEGER NOT NULL, -- Positive for earning, negative for spending
      reference_id INTEGER, -- ID of event or reward
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  // Seed admin user if not exists
  const adminCheck = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
  if (!adminCheck) {
    console.log("Database initialized. No admin user yet.");
  }

  // Seed Events
  const eventsCount = db.prepare('SELECT count(*) as count FROM events').get() as { count: number };
  if (eventsCount.count === 0) {
    const insertEvent = db.prepare(`
      INSERT INTO events (name, description, date, location, points_reward, qr_code)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    insertEvent.run('Arab Cultural Night', 'Join us for a night of music, food, and culture.', new Date(Date.now() + 86400000 * 2).toISOString(), 'University Hall A', 80, 'EVENT_CULTURAL_NIGHT_2024');
    insertEvent.run('Weekly Meetup', 'Casual hangout with tea and snacks.', new Date(Date.now() + 86400000 * 5).toISOString(), 'Student Cafe', 30, 'EVENT_WEEKLY_MEETUP_1');
    insertEvent.run('Career Workshop', 'CV review and networking tips.', new Date(Date.now() + 86400000 * 10).toISOString(), 'Library Room 3', 50, 'EVENT_CAREER_WORKSHOP_1');
  }

  // Seed Partners
  const partnersCount = db.prepare('SELECT count(*) as count FROM partners').get() as { count: number };
  if (partnersCount.count === 0) {
    const insertPartner = db.prepare(`
      INSERT INTO partners (name, type, address, description, image_url)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertPartner.run('Sahara Cafe', 'cafe', 'Main Street 123', 'Authentic tea and coffee.', 'https://picsum.photos/seed/sahara/200/200');
    insertPartner.run('Cairo Kitchen', 'restaurant', 'Market Square 45', 'Best koshary in town.', 'https://picsum.photos/seed/cairo/200/200');
  }
}

export default db;
