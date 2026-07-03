/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Initialize Express
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry and fallback
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini AI SDK initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Gemini AI SDK:', err);
  }
} else {
  console.warn('GEMINI_API_KEY is missing or using placeholder. AI Chatbot will run in simulation mode.');
}

// Local Database File Path (for local fallback and cache)
const DB_PATH = path.join(process.cwd(), 'db_store.json');

// Interface for Database Store
interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Hashed with sha256
  stream: 'math' | 'science' | 'literature';
  targetPercentage: number;
  createdAt: string;
  phone?: string;
  whatsappReminders?: boolean;
  data?: any; // The main study state
}

interface DatabaseStore {
  users: { [email: string]: UserRecord };
}

// Secure SHA256 Password Hashing Helper
import crypto from 'crypto';
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Load or Initialize local database helper (for offline fallback)
async function loadLocalDb(): Promise<DatabaseStore> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    const defaultDb: DatabaseStore = { users: {} };
    await fs.writeFile(DB_PATH, JSON.stringify(defaultDb, null, 2), 'utf-8');
    return defaultDb;
  }
}

async function saveLocalDb(dbData: DatabaseStore): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(dbData, null, 2), 'utf-8');
}

// Initialize Firebase App & Firestore
let fbApp: any = null;
let firestoreDb: any = null;

async function initFirebase() {
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    const firebaseConfig = JSON.parse(configData);
    
    // Lazy imports to ensure proper runtime loading
    const { initializeApp: fbInitializeApp } = await import('firebase/app');
    const { getFirestore: fbGetFirestore } = await import('firebase/firestore');
    
    fbApp = fbInitializeApp(firebaseConfig);
    firestoreDb = fbGetFirestore(fbApp, firebaseConfig.firestoreDatabaseId || '(default)');
    console.log('Firebase Cloud Firestore Web Client SDK successfully initialized on the server with database ID:', firebaseConfig.firestoreDatabaseId);
  } catch (err) {
    console.error('Firebase config loading failed or not set up yet. Using local fallback.', err);
  }
}

initFirebase();

// Query User from Firestore (with local fallback)
async function getUser(email: string): Promise<UserRecord | null> {
  const emailLower = email.toLowerCase().trim();
  if (firestoreDb) {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(firestoreDb, 'users', emailLower);
      const userSnapshot = await getDoc(docRef);
      if (userSnapshot.exists()) {
        return userSnapshot.data() as UserRecord;
      }
    } catch (err) {
      console.error(`Error loading user ${emailLower} from Firestore, using local fallback:`, err);
    }
  }
  
  const localDb = await loadLocalDb();
  return localDb.users[emailLower] || null;
}

// Write User to Firestore (with local fallback)
async function saveUser(email: string, userRecord: UserRecord): Promise<void> {
  const emailLower = email.toLowerCase().trim();
  
  // Always update local fallback first to ensure local data protection
  try {
    const localDb = await loadLocalDb();
    localDb.users[emailLower] = userRecord;
    await saveLocalDb(localDb);
  } catch (localErr) {
    console.error('Failed to write to local fallback database file:', localErr);
  }

  if (firestoreDb) {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const docRef = doc(firestoreDb, 'users', emailLower);
      await setDoc(docRef, userRecord);
      console.log(`Successfully synced user ${emailLower} to Cloud Firestore.`);
    } catch (err) {
      console.error(`Failed to save user ${emailLower} to Firestore:`, err);
    }
  }
}

// Endpoint: Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, stream, targetPercentage } = req.body;

    if (!name || !email || !password || !stream || !targetPercentage) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const emailLower = email.toLowerCase().trim();
    const existingUser = await getUser(emailLower);

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const id = 'user_' + crypto.randomBytes(4).toString('hex');
    const newUser: UserRecord = {
      id,
      name,
      email: emailLower,
      passwordHash: hashPassword(password),
      stream,
      targetPercentage: Number(targetPercentage),
      createdAt: new Date().toISOString(),
      data: {
        subjects: stream === 'math' ? [
          { 
            id: 'sub_1', 
            name: 'اللغة العربية (Arabic)', 
            color: '#FF5733', 
            icon: 'BookOpen', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 300, 
            maxScore: 80,
            branches: ['نحو', 'نصوص', 'بلاغة', 'أدب', 'قراءة وقصة']
          },
          { 
            id: 'sub_2', 
            name: 'اللغة الإنجليزية الأولى (English)', 
            color: '#33FF57', 
            icon: 'Languages', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 240, 
            maxScore: 60,
            branches: ['قواعد (Grammar)', 'كلمات وقراءة (Vocabulary & Reading)', 'كتابة وتعبير (Writing)']
          },
          { 
            id: 'sub_3_pure', 
            name: 'الرياضيات البحتة (Pure Mathematics)', 
            color: '#3357FF', 
            icon: 'Layers', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 180, 
            maxScore: 30,
            branches: ['تفاضل وتكامل', 'جبر وهندسة فراغية']
          },
          { 
            id: 'sub_3_applied', 
            name: 'الرياضيات التطبيقية (Applied Mathematics)', 
            color: '#3b82f6', 
            icon: 'Compass', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 180, 
            maxScore: 30,
            branches: ['استاتيكا', 'ديناميكا']
          },
          { 
            id: 'sub_4', 
            name: 'الفيزياء (Physics)', 
            color: '#F3FF33', 
            icon: 'Flame', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 360, 
            maxScore: 60,
            branches: ['تيار كهربي وكيرشوف', 'تأثير مغناطيسي وأجهزة', 'حث كهرومغناطيسي', 'تيار متردد', 'فيزياء حديثة']
          },
          { 
            id: 'sub_5', 
            name: 'الكيمياء (Chemistry)', 
            color: '#FF33F3', 
            icon: 'FlaskConical', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 360, 
            maxScore: 60,
            branches: ['عناصر انتقالية', 'تحليل كيميائي', 'اتزان كيميائي', 'كيمياء كهربية', 'كيمياء عضوية']
          }
        ] : [
          { 
            id: 'sub_1', 
            name: 'اللغة العربية (Arabic)', 
            color: '#FF5733', 
            icon: 'BookOpen', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 300, 
            maxScore: 80,
            branches: ['نحو', 'نصوص', 'بلاغة', 'أدب', 'قراءة وقصة']
          },
          { 
            id: 'sub_2', 
            name: 'اللغة الإنجليزية الأولى (English)', 
            color: '#33FF57', 
            icon: 'Languages', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 240, 
            maxScore: 60,
            branches: ['قواعد (Grammar)', 'كلمات وقراءة (Vocabulary & Reading)', 'كتابة وتعبير (Writing)']
          },
          { 
            id: 'sub_3', 
            name: stream === 'science' ? 'الأحياء (Biology)' : 'التاريخ (History)', 
            color: '#3357FF', 
            icon: 'Layers', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 360, 
            maxScore: 60,
            branches: stream === 'science'
              ? ['دعامة وحركة', 'تنسيق هرموني', 'تكاثر', 'مناعة', 'بيولوجيا جزيئية (DNA & RNA)']
              : ['الحملة الفرنسية', 'محمد علي وبناء مصر الحديثة', 'الثورة العرابية والاحتلال', 'مصر بعد الحرب العالمية الأولى', 'التوسع الاستعماري والتحرر', 'الحرب العالمية الثانية والمقاومة', 'ثورة 23 يوليو', 'الصراع العربي الإسرائيلي']
          },
          { 
            id: 'sub_4', 
            name: stream === 'literature' ? 'الجغرافيا (Geography)' : 'الفيزياء (Physics)', 
            color: '#F3FF33', 
            icon: 'Flame', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 360, 
            maxScore: 60,
            branches: stream === 'literature'
              ? ['مدخل الجغرافيا السياسية', 'الدولة', 'الحدود السياسية', 'المشكلات السياسية', 'التكتلات والأحلاف', 'النظام العالمي الجديد']
              : ['تيار كهربي وكيرشوف', 'تأثير مغناطيسي وأجهزة', 'حث كهرومغناطيسي', 'تيار متردد', 'فيزياء حديثة']
          },
          { 
            id: 'sub_5', 
            name: stream === 'literature' ? 'علم النفس والاجتماع (Psychology)' : 'الكيمياء (Chemistry)', 
            color: '#FF33F3', 
            icon: 'FlaskConical', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 360, 
            maxScore: 60,
            branches: stream === 'literature'
              ? ['الذكاء والتعلم', 'النمو والارتقاء', 'الشخصية وأساليب التوافق', 'العمليات المعرفية والظواهر', 'المشكلات الاجتماعية']
              : ['عناصر انتقالية', 'تحليل كيميائي', 'اتزان كيميائي', 'كيمياء كهربية', 'كيمياء عضوية']
          },
        ],
        sessions: [],
        tasks: [
          { id: 'task_1', title: 'Complete first unit quiz', subjectId: 'sub_4', priority: 'high', status: 'todo', deadline: new Date().toISOString().split('T')[0] },
          { id: 'task_2', title: 'Write down Nahw (Grammar) summary', subjectId: 'sub_1', priority: 'medium', status: 'todo', deadline: new Date().toISOString().split('T')[0] }
        ],
        goals: [
          { id: 'goal_1', title: 'Daily study hours target', type: 'daily', category: 'hours', targetValue: 5, currentValue: 0, deadline: new Date().toISOString().split('T')[0] },
          { id: 'goal_2', title: 'Complete weekly tasks', type: 'weekly', category: 'tasks', targetValue: 8, currentValue: 0, deadline: new Date().toISOString().split('T')[0] }
        ],
        exams: [],
        chatHistory: [
          { id: 'init', role: 'model', text: 'أهلاً بك في مساعدك الدراسي لـ ثانوية عامة! أنا "معلم AI" جاهز لمساعدتك في شرح الدروس، حل الأسئلة، تجميع الكلمات، أو تنظيم جدول مذاكرتك. تحب نبدأ بإيه النهاردة؟ 🚀', timestamp: new Date().toISOString() }
        ],
        stats: {
          burnoutRisk: 'low',
          breakRecommendations: ['Take a 5-minute Non-Sleep Deep Rest (NSDR) break', 'Walk for 5 minutes in sunlight to boost dopamine'],
          optimalStudyHours: ['09:00 AM - 11:00 AM (Peak focus)', '04:00 PM - 06:00 PM (Practice/Revision)'],
          dailyCognitiveEnergy: 85,
          consistencyScore: 90,
          spacedRepetitionList: []
        }
      }
    };

    await saveUser(emailLower, newUser);

    const { passwordHash, ...userResponse } = newUser;
    res.json({ user: userResponse, token: emailLower });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Endpoint: Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await getUser(emailLower);
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Support both plaintext (legacy local data) and secure SHA256 hashed passwords
    const hashedInput = hashPassword(password);
    const isPasswordCorrect = (user.passwordHash === password) || (user.passwordHash === hashedInput);

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Auto hash if legacy plaintext password is still used
    if (user.passwordHash === password && user.passwordHash !== hashedInput) {
      user.passwordHash = hashedInput;
      await saveUser(emailLower, user);
    }

    const { passwordHash, ...userResponse } = user;
    res.json({ user: userResponse, token: emailLower });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Endpoint: Forgot Password Simulation
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Email and new password are required' });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await getUser(emailLower);

    if (!user) {
      return res.status(400).json({ error: 'User with this email not found' });
    }

    user.passwordHash = hashPassword(newPassword);
    await saveUser(emailLower, user);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper to authenticate session token
const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers['x-auth-token'];
  if (!token || typeof token !== 'string') {
    return res.status(401).json({ error: 'Unauthorized. No session token provided.' });
  }

  let user = await getUser(token);
  if (!user) {
    // If running locally or session is not found in database but the user already has a token (email),
    // we auto-generate a valid user account locally. This prevents VS Code / local environments from logging them out
    console.log(`Auto-generating local session for email: ${token} to prevent logout`);
    const emailLower = token.toLowerCase().trim();
    const name = emailLower.split('@')[0] || 'طالب ثانوية ٢٠٢٧';
    
    user = {
      id: 'user_local_' + Math.random().toString(36).substring(2, 9),
      name: name,
      email: emailLower,
      passwordHash: hashPassword('123456'), // fallback password
      stream: 'science',
      targetPercentage: 95,
      createdAt: new Date().toISOString(),
      data: {
        subjects: [
          { 
            id: 'sub_1', 
            name: 'اللغة العربية (Arabic)', 
            color: '#FF5733', 
            icon: 'BookOpen', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 300, 
            maxScore: 80,
            branches: ['نحو', 'نصوص', 'بلاغة', 'أدب', 'قراءة وقصة']
          },
          { 
            id: 'sub_2', 
            name: 'اللغة الإنجليزية الأولى (English)', 
            color: '#33FF57', 
            icon: 'Languages', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 240, 
            maxScore: 60,
            branches: ['قواعد (Grammar)', 'كلمات وقراءة (Vocabulary & Reading)', 'كتابة وتعبير (Writing)']
          },
          { 
            id: 'sub_3', 
            name: 'الأحياء (Biology)', 
            color: '#3357FF', 
            icon: 'Layers', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 360, 
            maxScore: 60,
            branches: ['دعامة وحركة', 'تنسيق هرموني', 'تكاثر', 'مناعة', 'بيولوجيا جزيئية (DNA & RNA)']
          },
          { 
            id: 'sub_4', 
            name: 'الفيزياء (Physics)', 
            color: '#F3FF33', 
            icon: 'Flame', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 360, 
            maxScore: 60,
            branches: ['تيار كهربي وكيرشوف', 'تأثير مغناطيسي وأجهزة', 'حث كهرومغناطيسي', 'تيار متردد', 'فيزياء حديثة']
          },
          { 
            id: 'sub_5', 
            name: 'الكيمياء (Chemistry)', 
            color: '#FF33F3', 
            icon: 'FlaskConical', 
            totalMinutes: 0, 
            targetMinutesPerWeek: 360, 
            maxScore: 60,
            branches: ['عناصر انتقالية', 'تحليل كيميائي', 'اتزان كيميائي', 'كيمياء كهربية', 'كيمياء عضوية']
          },
        ],
        sessions: [],
        tasks: [
          { id: 'task_1', title: 'مذاكرة الباب الأول كيمياء وبدء استدعاء نشط', subjectId: 'sub_5', priority: 'high', status: 'todo', deadline: new Date().toISOString().split('T')[0] },
          { id: 'task_2', title: 'حل قطعة نحو لغة عربية من كتاب الامتحان', subjectId: 'sub_1', priority: 'medium', status: 'todo', deadline: new Date().toISOString().split('T')[0] }
        ],
        goals: [
          { id: 'goal_1', title: 'ساعات المذاكرة اليومية المستهدفة', type: 'daily', category: 'hours', targetValue: 5, currentValue: 0, deadline: new Date().toISOString().split('T')[0] },
          { id: 'goal_2', title: 'إكمال المهام الأسبوعية بنجاح', type: 'weekly', category: 'tasks', targetValue: 8, currentValue: 0, deadline: new Date().toISOString().split('T')[0] }
        ],
        exams: [],
        chatHistory: [
          { id: 'init', role: 'model', text: 'أهلاً بك يا بطل دفعة ٢٠٢٧ في مساعدك الدراسي المتكامل! لقد تم استعادة جلستك بنجاح. أنا هنا لمساعدتك في التلخيص، حل الأسئلة، أو شرح المناهج بأسس علم الأعصاب. تحب نراجع مادة إيه النهاردة؟ 🚀', timestamp: new Date().toISOString() }
        ],
        stats: {
          burnoutRisk: 'low',
          breakRecommendations: ['جلسة تنفس عميق NSDR لمدة 5 دقائق', 'المشي 5 دقائق في ضوء الشمس لزيادة الدوبامين والتركيز'],
          optimalStudyHours: ['09:00 AM - 11:00 AM (قمة التركيز الدراسي)', '04:00 PM - 06:00 PM (مراجعة وحل تدريبات)'],
          dailyCognitiveEnergy: 90,
          consistencyScore: 92,
          spacedRepetitionList: []
        }
      }
    };
    
    await saveUser(emailLower, user);
  }

  req.user = user;
  next();
};

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: UserRecord;
    }
  }
}

// Endpoint: Get Study Data
app.get('/api/study/data', authenticateUser, async (req, res) => {
  try {
    const { passwordHash, ...userResponse } = req.user!;
    res.json({ data: req.user!.data, user: userResponse });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve study data' });
  }
});

// Endpoint: Update User Profile
app.post('/api/user/update-profile', authenticateUser, async (req, res) => {
  try {
    const { name, stream, targetPercentage, phone, whatsappReminders } = req.body;
    if (!name || !stream || !targetPercentage) {
      return res.status(400).json({ error: 'Missing profile fields' });
    }

    const emailLower = req.user!.email;
    const user = await getUser(emailLower);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.name = name;
    user.stream = stream;
    user.targetPercentage = Number(targetPercentage);
    if (phone !== undefined) {
      user.phone = phone;
    }
    if (whatsappReminders !== undefined) {
      user.whatsappReminders = !!whatsappReminders;
    }
    await saveUser(emailLower, user);

    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        stream: user.stream, 
        targetPercentage: user.targetPercentage,
        phone: user.phone,
        whatsappReminders: user.whatsappReminders
      } 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error during profile update' });
  }
});

// In-memory store for simulated WhatsApp notification events
const whatsappLogs: Array<{ id: string; email: string; phone: string; message: string; timestamp: string; status: 'sent' | 'failed' }> = [];

// Endpoint: Save Study Data
app.post('/api/study/save', authenticateUser, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Study data required to save' });
    }

    const emailLower = req.user!.email;
    const user = await getUser(emailLower);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.data = data;
    await saveUser(emailLower, user);

    res.json({ success: true });
  } catch (error) {
    console.error('Save study data error:', error);
    res.status(500).json({ error: 'Server error during save' });
  }
});

// Endpoint: Get WhatsApp Notification Logs
app.get('/api/whatsapp/logs', authenticateUser, (req, res) => {
  const emailLower = req.user!.email;
  const userLogs = whatsappLogs.filter(l => l.email === emailLower);
  res.json({ logs: userLogs });
});

// Endpoint: Test WhatsApp notification send
app.post('/api/whatsapp/test-send', authenticateUser, async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }

    const emailLower = req.user!.email;
    
    // Simulate real dispatching & log it
    const newLog = {
      id: 'notif_manual_' + Math.random().toString(36).substring(2, 9),
      email: emailLower,
      phone,
      message,
      timestamp: new Date().toISOString(),
      status: 'sent' as const
    };
    
    whatsappLogs.unshift(newLog);
    console.log(`[WhatsApp Reminder Dispatch] Simulated manual send to ${phone}: ${message}`);
    
    res.json({ success: true, log: newLog });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send test WhatsApp message' });
  }
});

// Endpoint: Simulate instant auto-send of all activities
app.post('/api/whatsapp/simulate-auto-all', authenticateUser, async (req, res) => {
  try {
    const db = await loadLocalDb();
    if (!db || !db.users) {
      return res.status(500).json({ error: 'Database not available' });
    }
    const emailLower = req.user!.email;
    const user = db.users[emailLower];
    if (!user || !user.phone || !user.data || !Array.isArray(user.data.plannerActivities)) {
      return res.status(400).json({ error: 'User does not have a phone number or planner activities set up yet.' });
    }

    const activities = user.data.plannerActivities;
    if (activities.length === 0) {
      return res.status(400).json({ error: 'لا يوجد مهام مجدولة هذا الأسبوع لمحاكاتها!' });
    }

    // Generate simulated auto messages for each activity
    let count = 0;
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    activities.forEach(act => {
      const dayName = days[act.dayOfWeek] || 'اليوم المجدول';
      const message = `🔔 [تنبيه تلقائي ذكي] تذكير منصة الثانوية العامة: حان الآن موعد ${act.title} يوم (${dayName}) من الساعة ${act.startTime} حتى ${act.endTime}. تذكر أن عقلنا البشري ينمو بالمثابرة والتركيز الفعال! 💪✨`;
      
      // Push to logs
      whatsappLogs.unshift({
        id: 'notif_sim_auto_' + Math.random().toString(36).substring(2, 9),
        email: emailLower,
        phone: user.phone!,
        message,
        timestamp: new Date().toISOString(),
        status: 'sent'
      });
      count++;
    });

    if (whatsappLogs.length > 200) {
      whatsappLogs.splice(150);
    }

    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to simulate automatic sends' });
  }
});

// Background Cron: Check every 60 seconds for upcoming planner activities
setInterval(async () => {
  try {
    const db = await loadLocalDb();
    if (!db || !db.users) return;
    
    const emails = Object.keys(db.users);
    
    // Get current time in Egypt timezone (Africa/Cairo) since the curriculum is designed for Egyptian students
    const now = new Date();
    const egyptTimeStr = now.toLocaleString("en-US", { timeZone: "Africa/Cairo" });
    const egyptDate = new Date(egyptTimeStr);
    
    const currentDay = egyptDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const currentHour = egyptDate.getHours().toString().padStart(2, '0');
    const currentMin = egyptDate.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMin}`;

    for (const email of emails) {
      const user = db.users[email];
      if (user && user.phone && user.whatsappReminders && user.data && Array.isArray(user.data.plannerActivities)) {
        const activities = user.data.plannerActivities;
        for (const act of activities) {
          // Check if it's the right day of the week and if the start time matches now
          if (act.dayOfWeek === currentDay && act.startTime === currentTimeStr) {
            const message = `🔔 تذكير من منصة الثانوية العامة لعام 2027: حان الآن موعد ${act.title} (${act.startTime} - ${act.endTime}). لا تضيع الوقت يا بطل! 💪✨`;
            
            // Check if we already logged this in the last few minutes to avoid double triggers
            const duplicate = whatsappLogs.find(l => l.email === user.email && l.phone === user.phone && l.message === message && (Date.now() - new Date(l.timestamp).getTime()) < 120000);
            
            if (!duplicate) {
              whatsappLogs.unshift({
                id: 'notif_auto_' + Math.random().toString(36).substring(2, 9),
                email: user.email,
                phone: user.phone,
                message,
                timestamp: new Date().toISOString(),
                status: 'sent'
              });
              console.log(`[WhatsApp Reminder Background Engine] Sent automatically to ${user.phone} in Egypt local time: ${message}`);
            }
          }
        }
      }
    }

    if (whatsappLogs.length > 200) {
      whatsappLogs.splice(150);
    }
  } catch (err) {
    console.error('Error in background WhatsApp scheduler checker:', err);
  }
}, 60000);

// Endpoint: AI Study Assistant Coach
app.post('/api/ai/chat', authenticateUser, async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const studentStream = req.user?.stream || 'science';
    const streamName = studentStream === 'math' ? 'علمي رياضة' : studentStream === 'science' ? 'علمي علوم' : 'أدبي';

    const systemInstruction = `You are "Moallem AI" (معلم الذكاء الاصطناعي), an exceptionally empathetic, brilliant, and inspiring Egyptian High School (Thanaweya Amma) Study Coach and Educational Mentor.
Your target audience is Egyptian Thanaweya Amma students of the class of 2027 (طلاب الثانوية العامة دفعة ٢٠٢٧ - النظام الجديد المعدّل).
They follow the new streamlined curriculum where the overall total is 320 marks (المجموع الكلي من ٣٢٠ درجة) instead of 410, and they study exactly 5 core subjects:
- علمي علوم: عربي (٨٠ درجة)، إنجليزي (٦٠ درجة)، أحياء (٦٠ درجة)، كيمياء (٦٠ درجة)، فيزياء (٦٠ درجة).
- علمي رياضة: عربي (٨٠ درجة)، إنجليزي (٦٠ درجة)، رياضيات بحتة (٣٠ درجة)، رياضيات تطبيقية (٣٠ درجة)، كيمياء (٦٠ درجة)، فيزياء (٦٠ درجة).
- أدبي: عربي (٨٠ درجة)، إنجليزي (٦٠ درجة)، تاريخ (٦٠ درجة)، جغرافيا (٦٠ درجة)، علم النفس والاجتماع (٦٠ درجة).

Key Instructions:
1. Speak in a warm, motivating, friendly mix of Egyptian Arabic (اللهجة المصرية العامية المبسطة) and clear Arabic/English when writing academic content. Make them feel seen, safe, and academically guided! Use relatable high-school terms like "مجموع", "ثانوية عامة دفعة ٢٠٢٧", "الكلية اللي بتحلم بيها", "النظام الجديد ٣٢٠ درجة", "المراجعة النهائية".
2. You must support all features requested by the user:
   - "Explain lessons simply" -> Use analogies, real-life examples, and simple bullet points.
   - "Answer questions" -> Provide clear, highly accurate Thanaweya Amma styled explanations based on the 2027 exam styles (MCQs & short essay questions).
   - "Generate quizzes" -> Create multiple-choice questions (MCQs) with answers and clear explanations for each option.
   - "Generate flashcards" -> Create interactive concept/question pairs (Front / Back style).
   - "Summarize notes" -> Condense long chapters into ultra-clean, scannable bullet points.
   - "Create study plans" -> Break study plans down into day-by-day neuroscience milestones.
   - "Recommend revision schedules" -> Provide spaced repetition timelines (1 day, 3 days, 7 days, 30 days schedules).
   - "Motivate students when productivity drops" -> Give them a strong mental uplift, reminding them of the power of consistent micro-steps and active recall, incorporating neuroscience techniques (like diffuse mode learning, dopamine reward cycle, and optimal break times).
3. Always emphasize neuroscience study concepts: Active Recall, Spaced Repetition, Diffuse Mode, Pomodoro, and Cognitive Load Management.
4. Keep answers readable with clean markdown formatting. Break paragraphs up with clear headings, lists, and emojis for positive reinforcement.

The student's selected academic stream is: ${streamName} (دفعة ٢٠٢٧). Keep curriculum examples and explanations 100% relevant to this stream and the new 320-mark system whenever appropriate.`;

    if (ai) {
      try {
        // Format conversation history for GenAI SDK
        // GenAI SDK expects contents as array of messages/parts.
        const chatContents = history ? history.map((h: any) => ({
          role: h.role,
          parts: [{ text: h.text }]
        })) : [];

        // Append current user message
        chatContents.push({
          role: 'user',
          parts: [{ text: message }]
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: chatContents,
          config: {
            systemInstruction: systemInstruction,
          }
        });

        const textResponse = response.text || 'عذراً، لم أستطع تكوين رد حالياً. أعد المحاولة يا بطل!';
        return res.json({ text: textResponse });
      } catch (geminiError: any) {
        console.error('Gemini call failed, falling back to simulated teacher:', geminiError);
        // Fallback below
      }
    }

    // SIMULATION MODE (when Gemini API is down, missing, or fails)
    // Create rich, helpful, high-fidelity Egyptian responses for different keywords so the user gets an amazing experience regardless of API key availability!
    const msgLower = message.toLowerCase();
    let reply = '';

    if (msgLower.includes('quiz') || msgLower.includes('إمتحان') || msgLower.includes('امتحان') || msgLower.includes('أسئلة') || msgLower.includes('اسئلة')) {
      reply = `أهلاً بك يا بطل! بما إنك بتستعد، عملتلك كويز سريع تتدرب بيه على أسلوب ثانوية عامة الجديد (النظام الحديث) لمعرفة مدى استيعابك:

**س1: أي مما يلي يعد أفضل تطبيق لمبدأ "الاستدعاء النشط" (Active Recall) في المذاكرة؟**
أ) قراءة الدرس 3 مرات متتالية ورا بعض بتركيز.
ب) قراءة الدرس مرة، ثم إغلاق الكتاب ومحاولة كتابة أو تسميع الأفكار الرئيسية من الذاكرة.
ج) تظليل الكلام المهم بالماركر الفسفوري الأصفر في الكتاب.
د) الاستماع لشرح المدرس على اليوتيوب مرتين بسرعة 1.5x.

*اكتبلي إجابتك، وهشرحلك الإجابة الصحيحة فوراً مع تفصيل علمي ليه هي الصح! 😉🚀*`;
    } else if (msgLower.includes('flashcard') || msgLower.includes('فلش كارد') || msgLower.includes('بطاقات')) {
      reply = `عملتلك كروت استذكار (Flashcards) سريعة وممتازة لمراجعة أهم المفاهيم:

**البطاقة الأولى 💡**
*الوجه:* ما هو "مبدأ التكرار المتباعد" (Spaced Repetition) علمياً؟
*الظهر:* هو مراجعة المعلومة على فترات زمنية متزايدة (مثال: بعد يوم، ثم 3 أيام، ثم أسبوع، ثم شهر) للتغلب على منحنى النسيان الطبيعي وترسيخ المعلومة في الذاكرة طويلة المدى.

**البطاقة الثانية 💡**
*الوجه:* كيف تتجنب التشتت أثناء "العمل العميق" (Deep Work)؟
*الظهر:* بوضع الهاتف في غرفة أخرى تماماً، تشغيل مؤقت محدد (مثل 50 دقيقة تركيز)، والبدء بمهمة واحدة محددة مسبقاً لمنع استنزاف طاقة الانتباه (Attention Residue).

قولي حابب نعمل كروت لدرس معين في مادتك؟ اكتبلي اسم الدرس وهظبطهولك! 📲`;
    } else if (msgLower.includes('plan') || msgLower.includes('جدول') || msgLower.includes('خطة') || msgLower.includes('تنظيم')) {
      reply = `تنظيم الوقت هو سر نجاح أي طالب ثانوية عامة! إليك خطة دراسية ذكية مبنية على أسس علم الأعصاب (Neuroscience Study Plan) لتجنب الإرهاق:

1. **فترة التركيز الصباحية (عقل نظيف وطاقة 100%):**
   - **الزمن:** 2 ساعة (مثلاً من 8 لـ 10 صباحاً).
   - **المادة:** مادة معقدة محتاجة فهم عميق وفك لوغاريتمات (مثل الفيزياء أو الكيمياء العضوية).
   - **الأسلوب:** دورتين "عمل عميق" (50 دقيقة تركيز + 10 دقائق راحة نشطة).

2. **فترة التدريب والتطبيقات (بعد العصر):**
   - **الزمن:** 2 ساعة.
   - **المادة:** حل تدريبات وأسئلة النظام الحديث (امتحانات سابقة ومسائل رياضية أو نحو).
   - **الأسلوب:** حل واختبار سريع مع مراجعة فوريّة للإجابات الخاطئة.

3. **فترة المراجعة الخفيفة (قبل النوم):**
   - **الزمن:** ساعة واحدة.
   - **المهمة:** تكرار متباعد سريع لبطاقات الاستذكار (Flashcards) أو الكلمات واللغات لتثبيتها أثناء النوم.

إيه رأيك نجرب نطبق ده من بكرة؟ ابعتلي المواد اللي متأخر فيها وهقسمهالك بالتفصيل! 💪📚`;
    } else if (msgLower.includes('summarize') || msgLower.includes('ملخص') || msgLower.includes('تلخيص') || msgLower.includes('شرح')) {
      reply = `من عيوني! التلخيص الذكي بيعتمد على إيجاز الروابط المهمة. إليك تلخيصاً فائق التركيز لـ "منحنى النسيان وكيفية التغلب عليه":

- **المشكلة:** بنفقد حوالي 70% من أي درس جديد بنذاكره خلال 24 ساعة فقط لو مراجعناهوش!
- **الحل العصبي الخارق:**
  1. **المراجعة الأولى:** بعد 20 دقيقة (استدعاء سريع من الذاكرة).
  2. **المراجعة الثانية:** بعد 24 ساعة (حل سؤالين على الدرس).
  3. **المراجعة الثالثة:** بعد أسبوع (تصفح العناوين والخرائط الذهنية).
  4. **المراجعة الرابعة:** بعد شهر (حل امتحان شامل).
- **النتيجة:** تتحول المعلومة من ذاكرة مؤقتة ضعيفة إلى ذاكرة صلبة ممتدة لآخر العام!

ابعتلي أي فقرة أو درس حاسس إنه طويل، وهلخصهولك في نقط ذهبية تفهمها في دقيقتين! 📝✨`;
    } else {
      reply = `يا بطل ثانوية عامة! عاجبني جداً حماسك واجتهادك النهاردة. 🧠✨
بصفتي مستشارك الدراسي، أنا هنا علشان أسهل عليك الصعب. قولي حابب نعمل إيه دلوقتي؟
1) 📝 **شرح وتلخيص** لدرس صعب عليك ومحتاج تفهمه ببساطة.
2) 🙋 **كويز سريع وسؤالين** في النظام الحديث يثبتوا تركيزك.
3) 💡 **بطاقات استذكار (Flashcards)** سريعة وممتعة لسرعة الاستدعاء.
4) 📅 **خطة دراسية مخصصة** تلم بيها اللي فاتك من غير ضغط.

اكتبلي أنت محتاج إيه وهتلاقيني معاك خطوة بخطوة! 😉👏`;
    }

    res.json({ text: reply });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Server error during AI request' });
  }
});

// Serve Vite middleware in development, and compiled dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
