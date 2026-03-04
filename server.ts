import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { initDatabase } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize Database
initDatabase();

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, university, student_id } = req.body;
    
    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, university, student_id, role, membership_status)
      VALUES (?, ?, ?, ?, ?, 'student', 'pending')
    `);
    
    const info = stmt.run(name, email, hashedPassword, university, student_id);
    const userId = info.lastInsertRowid;
    
    const token = jwt.sign({ id: userId, role: 'student' }, JWT_SECRET, { expiresIn: '7d' });
    
    const user = db.prepare('SELECT id, name, email, role, points_balance, membership_status FROM users WHERE id = ?').get(userId);
    
    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = db.prepare('SELECT id, name, email, role, points_balance, membership_status, university, student_id FROM users WHERE id = ?').get(decoded.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Event Routes
app.get('/api/events', (req, res) => {
  try {
    const events = db.prepare('SELECT * FROM events ORDER BY date ASC').all();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

app.post('/api/events/checkin', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    
    const { qr_code } = req.body;
    
    // Find event
    const event = db.prepare('SELECT * FROM events WHERE qr_code = ?').get(qr_code);
    if (!event) {
      return res.status(404).json({ message: 'Invalid event code' });
    }

    // Check if already checked in
    const existingCheckin = db.prepare('SELECT id FROM transactions WHERE user_id = ? AND type = ? AND reference_id = ?')
      .get(decoded.id, 'event_checkin', event.id);
      
    if (existingCheckin) {
      return res.status(400).json({ message: 'Already checked in' });
    }

    // Add points
    const addPoints = db.transaction(() => {
      db.prepare('INSERT INTO transactions (user_id, type, points, reference_id, description) VALUES (?, ?, ?, ?, ?)')
        .run(decoded.id, 'event_checkin', event.points_reward, event.id, `Checked in to ${event.name}`);
        
      db.prepare('UPDATE users SET points_balance = points_balance + ? WHERE id = ?')
        .run(event.points_reward, decoded.id);
    });
    
    addPoints();
    
    res.json({ message: 'Check-in successful', points: event.points_reward });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Check-in failed' });
  }
});

// Partner Routes
app.get('/api/partners', (req, res) => {
  try {
    const partners = db.prepare('SELECT * FROM partners').all();
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching partners' });
  }
});

// Admin Routes
app.get('/api/admin/members', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const members = db.prepare('SELECT id, name, email, points_balance, membership_status FROM users WHERE role = ?').all('student');
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members' });
  }
});

app.post('/api/admin/events', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, role: string };
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, description, date, location, points_reward, qr_code } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO events (name, description, date, location, points_reward, qr_code, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(name, description, date, location, points_reward, qr_code, decoded.id);
    
    res.status(201).json({ message: 'Event created' });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
});

// Setup Admin Route (Dev only)
app.get('/api/setup-admin', async (req, res) => {
  try {
    const existingAdmin = db.prepare("SELECT id FROM users WHERE email = 'admin@asa.nl'").get();
    if (existingAdmin) {
      return res.json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    db.prepare(`
      INSERT INTO users (name, email, password, role, membership_status)
      VALUES (?, ?, ?, 'admin', 'active')
    `).run('Admin User', 'admin@asa.nl', hashedPassword);
    
    res.json({ message: 'Admin created: admin@asa.nl / admin123' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin' });
  }
});

// API Routes Placeholder
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development: Use Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static files
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
