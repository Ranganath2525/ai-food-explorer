import "dotenv/config"; // ✅ MUST be first line — loads .env into process.env
import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// ─── Add this object above your startServer() in server.ts ───────────────────
// These are free Unsplash food images — no copyright issues.
// Format: food keyword → unsplash image URL

const FOOD_IMAGE_MAP: Record<string, string> = {
  // Bengaluru foods
  "masala dosa":        "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&h=300&fit=crop",
  "dosa":               "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&h=300&fit=crop",
  "idli":               "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop",
  "idli sambar":        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop",
  "medu vada":          "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop",
  "vada":               "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop",
  "uttapam":            "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop",
  "bisi bele bath":     "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
  "kesari bath":        "https://images.unsplash.com/photo-1571197119638-41b9e41e9e6d?w=400&h=300&fit=crop",
  "filter coffee":      "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&h=300&fit=crop",
  "coffee":             "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&h=300&fit=crop",
  "rava idli":          "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop",
  "puri":               "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop",
  "puri bhaji":         "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop",

  // Mumbai foods
  "vada pav":           "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop",
  "pav bhaji":          "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop",
  "bhel puri":          "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
  "pani puri":          "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
  "sev puri":           "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
  "misal pav":          "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop",
  "dabeli":             "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop",

  // Delhi foods
  "butter chicken":     "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop",
  "chole bhature":      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
  "dal makhani":        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
  "tandoori chicken":   "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop",
  "kebab":              "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop",
  "biryani":            "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop",
  "hyderabadi biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop",
  "rajma":              "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
  "aloo tikki":         "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
  "chaat":              "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
  "lassi":              "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=300&fit=crop",
  "kulfi":              "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop",
  "jalebi":             "https://images.unsplash.com/photo-1571197119638-41b9e41e9e6d?w=400&h=300&fit=crop",
  "gulab jamun":        "https://images.unsplash.com/photo-1571197119638-41b9e41e9e6d?w=400&h=300&fit=crop",

  // South Indian
  "sambar":             "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop",
  "rasam":              "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=300&fit=crop",
  "appam":              "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop",
  "pongal":             "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
  "curd rice":          "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
  "chicken 65":         "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop",
  "kothu parotta":      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop",
  "parotta":            "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop",
  "fish curry":         "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop",
  "prawn":              "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop",
  "payasam":            "https://images.unsplash.com/photo-1571197119638-41b9e41e9e6d?w=400&h=300&fit=crop",

  // Hyderabad
  "haleem":             "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
  "irani chai":         "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&h=300&fit=crop",
  "chai":               "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&h=300&fit=crop",
  "tea":                "https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=400&h=300&fit=crop",

  // Kolkata
  "rosogolla":          "https://images.unsplash.com/photo-1571197119638-41b9e41e9e6d?w=400&h=300&fit=crop",
  "rasgulla":           "https://images.unsplash.com/photo-1571197119638-41b9e41e9e6d?w=400&h=300&fit=crop",
  "kathi roll":         "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop",
  "mishti doi":         "https://images.unsplash.com/photo-1571197119638-41b9e41e9e6d?w=400&h=300&fit=crop",
  "sandesh":            "https://images.unsplash.com/photo-1571197119638-41b9e41e9e6d?w=400&h=300&fit=crop",
  "macher jhol":        "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop",

  // Gujarati
  "dhokla":             "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop",
  "thepla":             "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop",
  "undhiyu":            "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
  "khandvi":            "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop",
  "fafda":              "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop",

  // Rajasthani
  "dal baati":          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
  "laal maas":          "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop",
  "ghevar":             "https://images.unsplash.com/photo-1571197119638-41b9e41e9e6d?w=400&h=300&fit=crop",

  // Generic
  "paneer":             "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop",
  "curry":              "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop",
  "rice":               "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
  "roti":               "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop",
  "naan":               "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop",
  "bread":              "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop",
  "sandwich":           "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop",
  "soup":               "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
  "salad":              "https://images.unsplash.com/photo-1512058454905-6b841e7ad132?w=400&h=300&fit=crop",
  "sweet":              "https://images.unsplash.com/photo-1571197119638-41b9e41e9e6d?w=400&h=300&fit=crop",
  "halwa":              "https://images.unsplash.com/photo-1571197119638-41b9e41e9e6d?w=400&h=300&fit=crop",
  "kheer":              "https://images.unsplash.com/photo-1571197119638-41b9e41e9e6d?w=400&h=300&fit=crop",
  "smoothie":           "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=300&fit=crop",
  "juice":              "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=300&fit=crop",
  "milkshake":          "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=300&fit=crop",
  "egg":                "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop",
  "noodles":            "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=300&fit=crop",
  "fried rice":         "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop",
  "spring roll":        "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop",
  "pakoda":             "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&h=300&fit=crop",
  "samosa":             "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop",
  "tikka":              "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop",
  "default":            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
};

// ✅ Helper function — call this wherever you need a food image
function getFoodImage(foodName: string): string {
  const lower = foodName.toLowerCase();
  // Try exact match first
  if (FOOD_IMAGE_MAP[lower]) return FOOD_IMAGE_MAP[lower];
  // Try partial match
  for (const [key, url] of Object.entries(FOOD_IMAGE_MAP)) {
    if (lower.includes(key) || key.includes(lower.split(' ')[0])) return url;
  }
  return FOOD_IMAGE_MAP['default'];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("foodspotter.db");
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// ✅ Mailer setup — reads from .env after dotenv/config is loaded
const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

db.function('haversine', (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
});

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    city TEXT NOT NULL,
    category TEXT,
    image TEXT,
    popularity_score REAL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    lat REAL,
    lng REAL,
    price_range TEXT,
    rating REAL DEFAULT 0,
    opening_hours TEXT,
    image TEXT
  );
  CREATE TABLE IF NOT EXISTS food_restaurants (
    food_id INTEGER,
    restaurant_id INTEGER,
    FOREIGN KEY(food_id) REFERENCES foods(id),
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id),
    PRIMARY KEY(food_id, restaurant_id)
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    restaurant_id INTEGER,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
  );
  CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER,
    item_id INTEGER,
    type TEXT CHECK(type IN ('food', 'restaurant')),
    PRIMARY KEY(user_id, item_id, type),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS otp_verifications (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at DATETIME NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    restaurant_id INTEGER,
    food_id INTEGER,
    type TEXT CHECK(type IN ('check-in', 'view', 'search', 'scan')),
    image_url TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY(food_id) REFERENCES foods(id)
  );
  CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    criteria_type TEXT NOT NULL,
    criteria_value INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_badges (
    user_id INTEGER,
    badge_id INTEGER,
    awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, badge_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(badge_id) REFERENCES badges(id)
  );
`);

const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
console.log(`[DB] Current user count: ${userCount.count}`);

if (userCount.count === 0) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run("Admin", "admin@foodspotter.com", hashedPassword, "admin");

  const foodStmt = db.prepare("INSERT INTO foods (name, description, city, category, image, popularity_score) VALUES (?, ?, ?, ?, ?, ?)");
  foodStmt.run("Vada Pav", "The iconic spicy potato burger of Mumbai.", "Mumbai", "street food", "https://picsum.photos/seed/vadapav/400/300", 4.8);
  foodStmt.run("Hyderabadi Biryani", "Fragrant basmati rice cooked with meat and spices.", "Hyderabad", "meal", "https://picsum.photos/seed/biryani/400/300", 4.9);
  foodStmt.run("Rosogolla", "Soft and spongy cottage cheese balls in syrup.", "Kolkata", "dessert", "https://picsum.photos/seed/rosogolla/400/300", 4.7);

  const restStmt = db.prepare("INSERT INTO restaurants (name, address, lat, lng, price_range, rating, opening_hours, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  restStmt.run("Ashok Vada Pav", "Kirti College, Dadar, Mumbai", 19.0178, 72.8300, "$", 4.9, "10:00 AM - 9:00 PM", "https://picsum.photos/seed/ashok/400/300");
  restStmt.run("Paradise Biryani", "Secunderabad, Hyderabad", 17.4435, 78.4983, "$$", 4.8, "11:00 AM - 11:00 PM", "https://picsum.photos/seed/paradise/400/300");
  restStmt.run("KC Das", "Esplanade, Kolkata", 22.5645, 88.3520, "$", 4.7, "9:00 AM - 9:00 PM", "https://picsum.photos/seed/kcdas/400/300");

  db.prepare("INSERT INTO food_restaurants (food_id, restaurant_id) VALUES (1, 1)").run();
  db.prepare("INSERT INTO food_restaurants (food_id, restaurant_id) VALUES (2, 2)").run();
  db.prepare("INSERT INTO food_restaurants (food_id, restaurant_id) VALUES (3, 3)").run();

  const badgeStmt = db.prepare("INSERT INTO badges (name, description, icon, criteria_type, criteria_value) VALUES (?, ?, ?, ?, ?)");
  badgeStmt.run("Street Food Explorer", "Try 5 different street foods", "🍢", "food_count", 5);
  badgeStmt.run("Reviewer", "Write 3 restaurant reviews", "✍️", "review_count", 3);
  badgeStmt.run("Check-in King", "Check in at 10 different restaurants", "👑", "checkin_count", 10);
  badgeStmt.run("AI Scanner", "Scan 5 food items using AI", "📸", "scan_count", 5);
}


// This updates all food images in the DB to use proper food photos.
// Run once — safe to leave in permanently.
 
const imageUpdateCheck = db.prepare(
  "SELECT COUNT(*) as count FROM foods WHERE image LIKE '%picsum%' OR image LIKE '%Kitchen%' OR image LIKE '%seed/%'"
).get() as { count: number };
 
if (imageUpdateCheck.count > 0) {
  console.log(`[DB] Updating ${imageUpdateCheck.count} food images...`);
 
  const allFoods = db.prepare("SELECT id, name FROM foods").all() as { id: number; name: string }[];
  const updateStmt = db.prepare("UPDATE foods SET image = ? WHERE id = ?");
 
  for (const food of allFoods) {
    const image = getFoodImage(food.name);
    updateStmt.run(image, food.id);
  }
 
  console.log('[DB] Food images updated successfully');
}
 

import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const recommendationCache = new Map<string, { data: any; ts: number }>();
const planCache            = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

// ✅ Add this above startServer()
const SEARCH_CORRECTIONS: Record<string, string> = {
  'biriyani': 'biryani',
  'biriani': 'biryani',
  'bryani': 'biryani',
  'briyani': 'biryani',
  'dosa': 'dosa',
  'idly': 'idli',
  'vadapav': 'vada pav',
  'pavbhaji': 'pav bhaji',
  'panipuri': 'pani puri',
  'golgappa': 'pani puri',
  'chole': 'chole bhature',
  'butter chicken': 'butter chicken',
  'dal makhni': 'dal makhani',
  'naan': 'naan',
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "20mb" }));

  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    next();
  };

  // ─── Auth Routes ─────────────────────────────────────────────────────────────

  // ✅ SINGLE signup route — sends real email via nodemailer
  app.post("/api/auth/signup", async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (existingUser) return res.status(400).json({ error: "Email already exists" });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const hashedPassword = bcrypt.hashSync(password, 10);

      db.prepare(`INSERT OR REPLACE INTO otp_verifications (email, name, password, otp, expires_at) VALUES (?, ?, ?, ?, ?)`)
        .run(email, name, hashedPassword, otp, expiresAt);

      await mailer.sendMail({
        from: `"FoodSpotter" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your FoodSpotter Verification Code",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9fafb;border-radius:16px">
            <h2 style="color:#10b981;margin-bottom:8px">FoodSpotter 🍽️</h2>
            <p style="color:#374151">Hi <strong>${name}</strong>, welcome aboard!</p>
            <p style="color:#374151">Your verification code is:</p>
            <div style="font-size:40px;font-weight:900;letter-spacing:12px;color:#18181b;background:#fff;padding:24px;border-radius:12px;text-align:center;margin:16px 0">
              ${otp}
            </div>
            <p style="color:#6b7280;font-size:13px">This code expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>
          </div>
        `,
      });

      console.log(`[EMAIL] OTP sent to ${email}`);
      res.json({ message: "OTP sent to email", email });
    } catch (e: any) {
      console.error("[SIGNUP ERROR]", e?.message || e);
      res.status(500).json({ error: "Failed to send OTP. Check server logs." });
    }
  });

  app.post("/api/auth/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    try {
      const record = db.prepare("SELECT * FROM otp_verifications WHERE email = ?").get(email) as any;
      if (!record) return res.status(400).json({ error: "No verification pending for this email" });
      if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
      if (new Date() > new Date(record.expires_at)) return res.status(400).json({ error: "OTP expired" });
      const result = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)").run(record.name, record.email, record.password);
      db.prepare("DELETE FROM otp_verifications WHERE email = ?").run(email);
      const token = jwt.sign({ id: result.lastInsertRowid, email: record.email, role: 'user' }, JWT_SECRET);
      res.json({ token, user: { id: result.lastInsertRowid, name: record.name, email: record.email, role: 'user' } });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const trimmedEmail = email?.trim();
    try {
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(trimmedEmail) as any;
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (e) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/auth/profile", authenticate, (req: any, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, req.user.id);
    res.json(db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(req.user.id));
  });

  // ─── Food Routes ─────────────────────────────────────────────────────────────

app.get("/api/foods", (req, res) => {
  const { city, category, search } = req.query;

  // ✅ Use separate variable — can't reassign const
  const rawSearch = typeof search === 'string' ? search.toLowerCase().trim() : '';
  const searchTerm = SEARCH_CORRECTIONS[rawSearch] || rawSearch;

  let query = `
    SELECT f.*, r.id as restaurant_id, r.name as restaurant_name,
           r.lat, r.lng, r.rating as restaurant_rating,
           r.image as restaurant_image, r.address as restaurant_address
    FROM foods f
    LEFT JOIN food_restaurants fr ON f.id = fr.food_id
    LEFT JOIN restaurants r ON fr.restaurant_id = r.id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (city)       { query += " AND LOWER(f.city) = LOWER(?)"; params.push(city); }
  if (category)   { query += " AND f.category = ?"; params.push(category); }
  if (searchTerm) { query += " AND (LOWER(f.name) LIKE LOWER(?) OR LOWER(f.description) LIKE LOWER(?) OR LOWER(f.category) LIKE LOWER(?) OR LOWER(f.city) LIKE LOWER(?)";
                    query += ")";
                    params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`); }
  res.json(db.prepare(query).all(...params));
  });
  app.get("/api/foods/nearby", (req, res) => {
    const { lat, lng, radius = 1 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Latitude and longitude are required" });
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    const maxDist = parseFloat(radius as string);
    res.json(db.prepare(`
      SELECT f.*, r.name as restaurant_name, r.address as restaurant_address,
             r.lat as restaurant_lat, r.lng as restaurant_lng,
             r.rating as restaurant_rating, r.price_range as restaurant_price_range,
             r.image as restaurant_image,
             haversine(?, ?, r.lat, r.lng) as distance
      FROM foods f
      JOIN food_restaurants fr ON f.id = fr.food_id
      JOIN restaurants r ON fr.restaurant_id = r.id
      WHERE haversine(?, ?, r.lat, r.lng) <= ?
      ORDER BY distance ASC
    `).all(userLat, userLng, userLat, userLng, maxDist));
  });

  app.get("/api/foods/trending", (req, res) => {
    const { lat, lng, radius = 10 } = req.query;
    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const maxDist = parseFloat(radius as string);
      res.json(db.prepare(`
        SELECT f.*, r.name as restaurant_name, r.lat, r.lng, r.rating as restaurant_rating,
               (f.popularity_score * 10 + r.rating * 5 +
                (SELECT COUNT(*) FROM user_activity ua WHERE ua.restaurant_id = r.id AND ua.type = 'check-in') * 2) as trending_score,
               haversine(?, ?, r.lat, r.lng) as distance
        FROM foods f
        JOIN food_restaurants fr ON f.id = fr.food_id
        JOIN restaurants r ON fr.restaurant_id = r.id
        WHERE haversine(?, ?, r.lat, r.lng) <= ?
        ORDER BY trending_score DESC LIMIT 10
      `).all(userLat, userLng, userLat, userLng, maxDist));
    } else {
      res.json(db.prepare(`
        SELECT f.*, r.name as restaurant_name, r.lat, r.lng, r.rating as restaurant_rating,
               (f.popularity_score * 10 + r.rating * 5 +
                (SELECT COUNT(*) FROM user_activity ua WHERE ua.restaurant_id = r.id AND ua.type = 'check-in') * 2) as trending_score
        FROM foods f
        JOIN food_restaurants fr ON f.id = fr.food_id
        JOIN restaurants r ON fr.restaurant_id = r.id
        ORDER BY trending_score DESC LIMIT 10
      `).all());
    }
  });

 
  app.get("/api/foods/recommended", async (req: any, res) => {
    const { lat, lng } = req.query;
    const userId = req.user?.id;
    if (!lat || !lng) return res.status(400).json({ error: "Location required" });
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
 
  // ✅ Check cache first — avoids hitting Gemini on every request
    const cacheKey = `${Math.round(userLat * 10)}-${Math.round(userLng * 10)}-${userId ?? 'anon'}`;
    const cached = recommendationCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return res.json(cached.data);
    }
 
    let history: any[] = [];
    if (userId) {
      history = db.prepare(`
        SELECT f.name, f.category, ua.type, r.name as restaurant
        FROM user_activity ua
        LEFT JOIN foods f ON ua.food_id = f.id
        LEFT JOIN restaurants r ON ua.restaurant_id = r.id
        WHERE ua.user_id = ?
        ORDER BY ua.timestamp DESC LIMIT 10
      `).all(userId) as any[];
    }
 
    const nearbyFoods = db.prepare(`
      SELECT f.name as food_name, f.popularity_score, f.image as food_image, f.category,
           r.name as restaurant_name, r.rating as restaurant_rating, r.lat, r.lng,
           haversine(?, ?, r.lat, r.lng) as distance
           FROM foods f JOIN food_restaurants fr ON f.id = fr.food_id JOIN restaurants r ON fr.restaurant_id = r.id
           WHERE haversine(?, ?, r.lat, r.lng) <= 20
           ORDER BY r.rating DESC, f.popularity_score DESC LIMIT 20
  `).all(userLat, userLng, userLat, userLng) as any[];
  if (nearbyFoods.length === 0) return res.json([]);
 
    try {
      const aiResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite", // ✅ better free tier limits than 2.0-flash
        contents: [{ parts: [{ text: `Based on user history and nearby options, predict foods they may love.
        User History: ${JSON.stringify(history)}
        Nearby Options: ${JSON.stringify(nearbyFoods)}
        Return ONLY a JSON array of top 5 with: food_name, restaurant_name, ai_reason.` }] }],
      config: { responseMimeType: "application/json" }
    });
 
    const recommendations = JSON.parse(aiResponse.text ?? "[]");
    const finalResult = recommendations.map((rec: any) => {
      const fullData = nearbyFoods.find(f =>
        f.food_name === rec.food_name && f.restaurant_name === rec.restaurant_name
      );
      return fullData ? { ...fullData, ai_reason: rec.ai_reason } : null;
    }).filter(Boolean);
 
    // ✅ Store in cache
    recommendationCache.set(cacheKey, { data: finalResult, ts: Date.now() });
    res.json(finalResult);
   } catch (e: any) {
    console.error("AI Recommendation Error:", e?.message || e);
    // ✅ Fallback to top rated nearby foods — no crash
    const fallback = nearbyFoods.slice(0, 5).map(f => ({
       ...f,
       ai_reason: "A highly rated choice in your area."
    }));
    recommendationCache.set(cacheKey, { data: fallback, ts: Date.now() });
    res.json(fallback);
  }
  });
 
  app.get("/api/foods/:id", (req, res) => {
    const food = db.prepare("SELECT * FROM foods WHERE id = ?").get(req.params.id);
    if (!food) return res.status(404).json({ error: "Food not found" });
    const restaurants = db.prepare(`
      SELECT r.* FROM restaurants r
      JOIN food_restaurants fr ON r.id = fr.restaurant_id
      WHERE fr.food_id = ?
    `).all(req.params.id);
    res.json({ ...food, restaurants });
  });

  // ─── Restaurant Routes ───────────────────────────────────────────────────────

  app.get("/api/restaurants", (req, res) => {
    res.json(db.prepare("SELECT * FROM restaurants").all());
  });

  app.get("/api/restaurants/:id", (req, res) => {
    const restaurant = db.prepare("SELECT * FROM restaurants WHERE id = ?").get(req.params.id) as any;
    if (!restaurant) return res.status(404).json({ error: "Restaurant not found" });
    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.restaurant_id = ? ORDER BY r.created_at DESC
    `).all(req.params.id);
    const foods = db.prepare(`
      SELECT f.* FROM foods f
      JOIN food_restaurants fr ON f.id = fr.food_id
      WHERE fr.restaurant_id = ?
    `).all(req.params.id);
    res.json({ ...restaurant, reviews, foods });
  });

  app.post("/api/restaurants/:id/check-in", authenticate, (req: any, res) => {
    try {
      db.prepare("INSERT INTO user_activity (user_id, restaurant_id, type) VALUES (?, ?, 'check-in')")
        .run(req.user.id, req.params.id);
      res.json({ message: "Checked in successfully" });
    } catch (e) {
      res.status(500).json({ error: "Failed to check in" });
    }
  });

  app.post("/api/restaurants/:id/reviews", authenticate, (req: any, res) => {
    const { rating, comment } = req.body;
    db.prepare("INSERT INTO reviews (user_id, restaurant_id, rating, comment) VALUES (?, ?, ?, ?)").run(req.user.id, req.params.id, rating, comment);
    const avg = db.prepare("SELECT AVG(rating) as avg FROM reviews WHERE restaurant_id = ?").get(req.params.id) as { avg: number };
    db.prepare("UPDATE restaurants SET rating = ? WHERE id = ?").run(avg.avg, req.params.id);
    res.json({ success: true });
  });

  app.get("/api/restaurants/:id/review-summary", async (req, res) => {
    const reviews = db.prepare("SELECT comment FROM reviews WHERE restaurant_id = ? LIMIT 20").all(req.params.id) as any[];
    if (reviews.length === 0) return res.json({ summary: "No reviews yet." });
    try {
      const text = reviews.map((r: any) => r.comment).join("\n");
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ parts: [{ text: `Summarize these restaurant reviews in 2-3 sentences: \n${text}` }] }]
      });
      res.json({ summary: response.text ?? "Summary unavailable." });
    } catch (e) {
      res.json({ summary: "AI summary unavailable." });
    }
  });

  // ─── Scan Food ───────────────────────────────────────────────────────────────

  app.post("/api/scan-food", authenticate, async (req: any, res) => {
    const { image, lat, lng } = req.body;
    if (!image) return res.status(400).json({ error: "Image required" });
    try {
      const matches = image.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!matches) return res.status(400).json({ error: "Invalid image format" });
      const mimeType = matches[1];
      const base64Data = matches[2];

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: "Identify this food dish. Return ONLY the dish name, nothing else. If it is not food, return exactly: Unknown" }
          ]
        }]
      });

      const dishName = (response.text ?? "").trim().replace(/^["']|["']$/g, "");
      console.log(`[SCAN] Identified dish: "${dishName}"`);

      if (!dishName || dishName === "Unknown") {
        return res.json({ name: "Unknown", confidence: 0, restaurants: [] });
      }

      const userLat = parseFloat(lat) || 12.9716;
      const userLng = parseFloat(lng) || 77.5946;

      const nearby = db.prepare(`
        SELECT f.name as food_name, f.image as food_image,
               r.name as restaurant_name, r.lat, r.lng, r.rating,
               haversine(?, ?, r.lat, r.lng) as distance
        FROM foods f
        JOIN food_restaurants fr ON f.id = fr.food_id
        JOIN restaurants r ON fr.restaurant_id = r.id
        WHERE (f.name LIKE ? OR f.description LIKE ?)
          AND haversine(?, ?, r.lat, r.lng) <= 5
        ORDER BY distance ASC
      `).all(userLat, userLng, `%${dishName}%`, `%${dishName}%`, userLat, userLng);

      db.prepare("INSERT INTO user_activity (user_id, type, image_url) VALUES (?, 'scan', ?)")
        .run(req.user.id, "scanned_via_ai");

      res.json({ name: dishName, confidence: 0.95, restaurants: nearby });
    } catch (e: any) {
      console.error("[SCAN ERROR]", e?.message || e);
      res.status(500).json({ error: "AI service failed to identify food", detail: e?.message });
    }
  });

  // ─── Other Routes ────────────────────────────────────────────────────────────
  app.get("/api/videos/street-food", async (req, res) => {
  const { city = "Bengaluru" } = req.query;

  const FOOD_VIDEOS = [
    { videoId: "UjvWwBTt44E", title: "Street Food Tour", location: "India" },
    { videoId: "Ni5Fy4H4CCk", title: "Famous Food Places", location: "India" },
    { videoId: "_q5GKCNZcHI", title: "Indian Street Food", location: "India" },
    { videoId: "J75VQSxOtdo", title: "Food Vlog", location: "India" },
    { videoId: "LtUnSQ_oBgo", title: "Street Food Guide", location: "India" },
  ];

  const result = FOOD_VIDEOS.map(v => ({
    ...v,
    id: v.videoId,
    thumbnail: `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
  }));

  res.json(result);
  });

  app.get("/api/food-heatmap", (req, res) => {
    res.json(db.prepare(`
      SELECT r.lat, r.lng,
             (r.rating * 2 + (SELECT COUNT(*) FROM user_activity ua WHERE ua.restaurant_id = r.id)) as intensity
      FROM restaurants r
    `).all());
  });

// ✅ Replace your existing /api/food-plan route in server.ts with this:

  app.get("/api/food-plan", async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Location required" });
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
 
  // ✅ Check cache first
    const planKey = `${Math.round(userLat * 10)}-${Math.round(userLng * 10)}`;
    const cachedPlan = planCache.get(planKey);
    if (cachedPlan && Date.now() - cachedPlan.ts < CACHE_TTL) {
    return res.json(cachedPlan.data);
   }
 
    const nearby = db.prepare(`
      SELECT f.name as food, f.category, r.name as restaurant, r.lat, r.lng, r.rating
      FROM foods f JOIN food_restaurants fr ON f.id = fr.food_id
      JOIN restaurants r ON fr.restaurant_id = r.id
      WHERE haversine(?, ?, r.lat, r.lng) <= 20
      ORDER BY r.rating DESC LIMIT 30
  `).all(userLat, userLng) as any[];
 
    const staticFallback = [
      { time: "Breakfast", food: "Masala Dosa",    lat: 12.9450, lng: 77.5700, restaurant: "Vidyarthi Bhavan",          reason: "A classic Bengaluru breakfast." },
      { time: "Lunch",     food: "Bisi Bele Bath", lat: 12.9552, lng: 77.5860, restaurant: "MTR (Mavalli Tiffin Rooms)", reason: "Hearty and filling for the afternoon." },
      { time: "Snack",     food: "Medu Vada",      lat: 12.9420, lng: 77.5750, restaurant: "Brahmin's Coffee Bar",       reason: "Legendary crispy vadas." },
      { time: "Dinner",    food: "Paneer Butter Masala", lat: 12.9352, lng: 77.6245, restaurant: "Adyar Ananda Bhavan",  reason: "End the day with rich paneer curry." },
    ];
    
    
    if (nearby.length === 0) {
      planCache.set(planKey, { data: staticFallback, ts: Date.now() });
      return res.json(staticFallback);
  }
  
  try {
    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite", // ✅ better free tier limits
      contents: [{
        parts: [{
          text: `Create a Food Day Plan (Breakfast, Lunch, Snack, Dinner) using these nearby options: ${JSON.stringify(nearby)}.
          Return ONLY a valid JSON array of exactly 4 objects. Each object must have: time, food, restaurant, reason.
          Do NOT include markdown, code fences, or any text outside the JSON array.`
        }]
      }],
      config: { responseMimeType: "application/json" }
    });
 
    const rawText = (aiResponse.text ?? "").trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");
 
    const parsed = JSON.parse(rawText);
    const enriched = Array.isArray(parsed) ? parsed.map((item: any) => {
      const match = nearby.find((n: any) =>
        n.restaurant?.toLowerCase() === item.restaurant?.toLowerCase()
      );
      return { ...item, lat: match?.lat ?? null, lng: match?.lng ?? null };
    }) : staticFallback;
 
    // ✅ Store in cache
    planCache.set(planKey, { data: enriched, ts: Date.now() });
    res.json(enriched);
  } catch (e: any) {
    console.error("[FOOD-PLAN ERROR]", e?.message || e);
    planCache.set(planKey, { data: staticFallback, ts: Date.now() });
    res.json(staticFallback);
  }
});

  app.get("/api/check-ins/nearby", (req, res) => {
    const { lat, lng } = req.query;
    const base = `
      SELECT ua.timestamp, u.name as user_name, r.name as restaurant_name, r.image as restaurant_image, r.lat, r.lng
      FROM user_activity ua
      JOIN users u ON ua.user_id = u.id
      JOIN restaurants r ON ua.restaurant_id = r.id
      WHERE ua.type = 'check-in'
    `;
    if (lat && lng) {
      res.json(db.prepare(base + ` AND haversine(?, ?, r.lat, r.lng) <= 10 ORDER BY ua.timestamp DESC LIMIT 20`)
        .all(parseFloat(lat as string), parseFloat(lng as string)));
    } else {
      res.json(db.prepare(base + ` ORDER BY ua.timestamp DESC LIMIT 20`).all());
    }
  });

  app.get("/api/food-trail", (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Location required" });
    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);
    const trail = db.prepare(`
      SELECT f.name as food_name, f.image as food_image, f.category,
             r.id as restaurant_id, r.name as restaurant_name, r.lat, r.lng, r.rating,
             haversine(?, ?, r.lat, r.lng) as distance
      FROM foods f JOIN food_restaurants fr ON f.id = fr.food_id
      JOIN restaurants r ON fr.restaurant_id = r.id
      WHERE haversine(?, ?, r.lat, r.lng) <= 5
      GROUP BY f.id ORDER BY f.popularity_score DESC, r.rating DESC LIMIT 5
    `).all(userLat, userLng, userLat, userLng) as any[];

    const sortedTrail: any[] = [];
    let currentPos = { lat: userLat, lng: userLng };
    const remaining = [...trail];
    while (remaining.length > 0) {
      let nearestIdx = 0, minDist = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const d = Math.sqrt(Math.pow(remaining[i].lat - currentPos.lat, 2) + Math.pow(remaining[i].lng - currentPos.lng, 2));
        if (d < minDist) { minDist = d; nearestIdx = i; }
      }
      const next = remaining.splice(nearestIdx, 1)[0];
      sortedTrail.push(next);
      currentPos = { lat: next.lat, lng: next.lng };
    }
    res.json(sortedTrail);
  });

  app.post("/api/ai-chat", async (req, res) => {
    const { message, lat, lng } = req.body;
    let context = "";
    if (lat && lng) {
      const nearby = db.prepare(`
        SELECT f.name, f.description, r.name as restaurant, r.rating, r.address,
               haversine(?, ?, r.lat, r.lng) as distance
        FROM foods f JOIN food_restaurants fr ON f.id = fr.food_id
        JOIN restaurants r ON fr.restaurant_id = r.id
        WHERE haversine(?, ?, r.lat, r.lng) <= 5
        ORDER BY distance ASC LIMIT 10
      `).all(parseFloat(lat), parseFloat(lng), parseFloat(lat), parseFloat(lng));
      context = `Nearby foods/restaurants: ${JSON.stringify(nearby)}`;
    }
    try {
      const chat = ai.chats.create({
        model: "gemini-2.0-flash-lite",
        config: { systemInstruction: `You are Food Guide AI, a helpful culinary assistant. ${context}` }
      });
      const response = await chat.sendMessage({ message });
      res.json({ text: response.text });
    } catch (e) {
      res.status(500).json({ error: "AI service unavailable" });
    }
  });

  app.get("/api/user/badges", authenticate, (req: any, res) => {
    res.json(db.prepare(`
      SELECT b.*, ub.awarded_at FROM badges b
      LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = ?
    `).all(req.user.id));
  });

  app.get("/api/leaderboard", (req, res) => {
    res.json(db.prepare(`
      SELECT u.name, COUNT(ua.id) as checkin_count FROM users u
      LEFT JOIN user_activity ua ON u.id = ua.user_id AND ua.type = 'check-in'
      GROUP BY u.id ORDER BY checkin_count DESC LIMIT 10
    `).all());
  });

  app.post("/api/favorites", authenticate, (req: any, res) => {
    const { itemId, type } = req.body;
    try {
      db.prepare("INSERT INTO favorites (user_id, item_id, type) VALUES (?, ?, ?)").run(req.user.id, itemId, type);
      res.json({ success: true });
    } catch (e) {
      db.prepare("DELETE FROM favorites WHERE user_id = ? AND item_id = ? AND type = ?").run(req.user.id, itemId, type);
      res.json({ success: true, removed: true });
    }
  });

  app.get("/api/favorites", authenticate, (req: any, res) => {
    const foods = db.prepare(`SELECT f.* FROM foods f JOIN favorites fav ON f.id = fav.item_id WHERE fav.user_id = ? AND fav.type = 'food'`).all(req.user.id);
    const restaurants = db.prepare(`SELECT r.* FROM restaurants r JOIN favorites fav ON r.id = fav.item_id WHERE fav.user_id = ? AND fav.type = 'restaurant'`).all(req.user.id);
    res.json({ foods, restaurants });
  });

  // ─── Admin Routes ────────────────────────────────────────────────────────────

  app.post("/api/admin/foods", authenticate, isAdmin, (req, res) => {
    const { name, description, city, category, image, popularity_score } = req.body;
    const result = db.prepare("INSERT INTO foods (name, description, city, category, image, popularity_score) VALUES (?, ?, ?, ?, ?, ?)").run(name, description, city, category, image, popularity_score);
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/admin/restaurants", authenticate, isAdmin, (req, res) => {
    const { name, address, lat, lng, price_range, opening_hours, image } = req.body;
    const result = db.prepare("INSERT INTO restaurants (name, address, lat, lng, price_range, opening_hours, image) VALUES (?, ?, ?, ?, ?, ?, ?)").run(name, address, lat, lng, price_range, opening_hours, image);
    res.json({ id: result.lastInsertRowid });
  });

  // ─── Vite / Static ───────────────────────────────────────────────────────────

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`[EMAIL] Using: ${process.env.EMAIL_USER || "⚠️ EMAIL_USER not set!"}`);
  });
}

startServer();
