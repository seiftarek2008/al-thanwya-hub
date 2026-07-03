"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = exports.whatsappSimulateAutoAll = exports.whatsappTestSend = exports.whatsappLogs = exports.updateProfile = exports.saveStudyData = exports.getStudyData = exports.forgotPassword = exports.login = exports.register = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const genai_1 = require("@google/genai");
const crypto = __importStar(require("crypto"));
// Initialize Firebase Admin SDK
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
// Secure SHA-256 Password Hashing Helper
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}
// Authenticate session token helper for onRequest handlers
async function getAuthenticatedUser(authToken) {
    if (!authToken || typeof authToken !== 'string') {
        return null;
    }
    const emailLower = authToken.toLowerCase().trim();
    const docRef = db.collection('users').doc(emailLower);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
        return docSnap.data();
    }
    // Auto-generation fallback logic like in server.ts
    const name = emailLower.split('@')[0] || 'طالب ثانوية ٢٠٢٧';
    const id = 'user_local_' + Math.random().toString(36).substring(2, 9);
    const defaultUser = {
        id,
        name,
        email: emailLower,
        passwordHash: hashPassword('123456'), // default fallback password
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
    await docRef.set(defaultUser);
    return defaultUser;
}
const getDefaultSubjects = (stream) => {
    if (stream === 'math') {
        return [
            { id: 'sub_1', name: 'اللغة العربية (Arabic)', color: '#FF5733', icon: 'BookOpen', totalMinutes: 0, targetMinutesPerWeek: 300, maxScore: 80, branches: ['نحو', 'نصوص', 'بلاغة', 'أدب', 'قراءة وقصة'] },
            { id: 'sub_2', name: 'اللغة الإنجليزية الأولى (English)', color: '#33FF57', icon: 'Languages', totalMinutes: 0, targetMinutesPerWeek: 240, maxScore: 60, branches: ['قواعد (Grammar)', 'كلمات وقراءة (Vocabulary & Reading)', 'كتابة وتعبير (Writing)'] },
            { id: 'sub_3_pure', name: 'الرياضيات البحتة (Pure Mathematics)', color: '#3357FF', icon: 'Layers', totalMinutes: 0, targetMinutesPerWeek: 180, maxScore: 30, branches: ['تفاضل وتكامل', 'جبر وهندسة فراغية'] },
            { id: 'sub_3_applied', name: 'الرياضيات التطبيقية (Applied Mathematics)', color: '#3b82f6', icon: 'Compass', totalMinutes: 0, targetMinutesPerWeek: 180, maxScore: 30, branches: ['استاتيكا', 'ديناميكا'] },
            { id: 'sub_4', name: 'الفيزياء (Physics)', color: '#F3FF33', icon: 'Flame', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['تيار كهربي وكيرشوف', 'تأثير مغناطيسي وأجهزة', 'حث كهرومغناطيسي', 'تيار متردد', 'فيزياء حديثة'] },
            { id: 'sub_5', name: 'الكيمياء (Chemistry)', color: '#FF33F3', icon: 'FlaskConical', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['عناصر انتقالية', 'تحليل كيميائي', 'اتزان كيميائي', 'كيمياء كهربية', 'كيمياء عضوية'] }
        ];
    }
    else if (stream === 'science') {
        return [
            { id: 'sub_1', name: 'اللغة العربية (Arabic)', color: '#FF5733', icon: 'BookOpen', totalMinutes: 0, targetMinutesPerWeek: 300, maxScore: 80, branches: ['نحو', 'نصوص', 'بلاغة', 'أدب', 'قراءة وقصة'] },
            { id: 'sub_2', name: 'اللغة الإنجليزية الأولى (English)', color: '#33FF57', icon: 'Languages', totalMinutes: 0, targetMinutesPerWeek: 240, maxScore: 60, branches: ['قواعد (Grammar)', 'كلمات وقراءة (Vocabulary & Reading)', 'كتابة وتعبير (Writing)'] },
            { id: 'sub_3', name: 'الأحياء (Biology)', color: '#3357FF', icon: 'Layers', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['دعامة وحركة', 'تنسيق هرموني', 'تكاثر', 'مناعة', 'بيولوجيا جزيئية (DNA & RNA)'] },
            { id: 'sub_4', name: 'الفيزياء (Physics)', color: '#F3FF33', icon: 'Flame', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['تيار كهربي وكيرشوف', 'تأثير مغناطيسي وأجهزة', 'حث كهرومغناطيسي', 'تيار متردد', 'فيزياء حديثة'] },
            { id: 'sub_5', name: 'الكيمياء (Chemistry)', color: '#FF33F3', icon: 'FlaskConical', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['عناصر انتقالية', 'تحليل كيميائي', 'اتزان كيميائي', 'كيمياء كهربية', 'كيمياء عضوية'] }
        ];
    }
    else {
        return [
            { id: 'sub_1', name: 'اللغة العربية (Arabic)', color: '#FF5733', icon: 'BookOpen', totalMinutes: 0, targetMinutesPerWeek: 300, maxScore: 80, branches: ['نحو', 'نصوص', 'بلاغة', 'أدب', 'قراءة وقصة'] },
            { id: 'sub_2', name: 'اللغة الإنجليزية الأولى (English)', color: '#33FF57', icon: 'Languages', totalMinutes: 0, targetMinutesPerWeek: 240, maxScore: 60, branches: ['قواعد (Grammar)', 'كلمات وقراءة (Vocabulary & Reading)', 'كتابة وتعبير (Writing)'] },
            { id: 'sub_3', name: 'التاريخ (History)', color: '#3357FF', icon: 'Layers', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['الحملة الفرنسية', 'محمد علي وبناء مصر الحديثة', 'الثورة العرابية والاحتلال', 'مصر بعد الحرب العالمية الأولى', 'التوسع الاستعماري والتحرر', 'الحرب العالمية الثانية والمقاومة', 'ثورة 23 يوليو', 'الصراع العربي الإسرائيلي'] },
            { id: 'sub_4', name: 'الجغرافيا (Geography)', color: '#F3FF33', icon: 'Flame', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['مدخل الجغرافيا السياسية', 'الدولة', 'الحدود السياسية', 'المشكلات السياسية', 'التكتلات والأحلاف', 'النظام العالمي الجديد'] },
            { id: 'sub_5', name: 'علم النفس والاجتماع (Psychology)', color: '#FF33F3', icon: 'FlaskConical', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['الذكاء والتعلم', 'النمو والارتقاء', 'الشخصية وأساليب التوافق', 'العمليات المعرفية والظواهر', 'المشكلات الاجتماعية'] }
        ];
    }
};
// 1. register
exports.register = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    try {
        const { name, email, password, stream, targetPercentage } = req.body;
        if (!name || !email || !password || !stream || !targetPercentage) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const emailLower = email.toLowerCase().trim();
        const docRef = db.collection('users').doc(emailLower);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            res.status(400).json({ error: 'Email already registered' });
            return;
        }
        const id = 'user_' + crypto.randomBytes(4).toString('hex');
        const newUser = {
            id,
            name,
            email: emailLower,
            passwordHash: hashPassword(password),
            stream,
            targetPercentage: Number(targetPercentage),
            createdAt: new Date().toISOString(),
            data: {
                subjects: getDefaultSubjects(stream),
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
        await docRef.set(newUser);
        const { passwordHash: _, ...userResponse } = newUser;
        res.json({ user: userResponse, token: emailLower });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});
// 2. login
exports.login = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const emailLower = email.toLowerCase().trim();
        const docRef = db.collection('users').doc(emailLower);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }
        const user = docSnap.data();
        const hashedInput = hashPassword(password);
        const isPasswordCorrect = (user.passwordHash === password) || (user.passwordHash === hashedInput);
        if (!isPasswordCorrect) {
            res.status(400).json({ error: 'Invalid email or password' });
            return;
        }
        // Auto hash if legacy plaintext
        if (user.passwordHash === password && user.passwordHash !== hashedInput) {
            user.passwordHash = hashedInput;
            await docRef.set(user);
        }
        const { passwordHash: _, ...userResponse } = user;
        res.json({ user: userResponse, token: emailLower });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});
// 3. forgotPassword
exports.forgotPassword = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            res.status(400).json({ error: 'Email and new password are required' });
            return;
        }
        const emailLower = email.toLowerCase().trim();
        const docRef = db.collection('users').doc(emailLower);
        const docSnap = await docRef.get();
        if (!docSnap.exists) {
            res.status(400).json({ error: 'User with this email not found' });
            return;
        }
        const user = docSnap.data();
        user.passwordHash = hashPassword(newPassword);
        await docRef.set(user);
        res.json({ success: true, message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// 4. getStudyData
exports.getStudyData = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    try {
        const token = req.headers['x-auth-token'];
        const user = await getAuthenticatedUser(token);
        if (!user) {
            res.status(401).json({ error: 'Unauthorized. No session token provided.' });
            return;
        }
        const { passwordHash: _, ...userResponse } = user;
        res.json({ data: user.data, user: userResponse });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to retrieve study data' });
    }
});
// 5. saveStudyData
exports.saveStudyData = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    try {
        const token = req.headers['x-auth-token'];
        const user = await getAuthenticatedUser(token);
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { data } = req.body;
        if (!data) {
            res.status(400).json({ error: 'Study data required to save' });
            return;
        }
        const emailLower = user.email.toLowerCase().trim();
        const docRef = db.collection('users').doc(emailLower);
        user.data = data;
        await docRef.set(user);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Save study data error:', error);
        res.status(500).json({ error: 'Server error during save' });
    }
});
// 6. updateProfile
exports.updateProfile = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    try {
        const token = req.headers['x-auth-token'];
        const user = await getAuthenticatedUser(token);
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { name, stream, targetPercentage, phone, whatsappReminders } = req.body;
        if (!name || !stream || !targetPercentage) {
            res.status(400).json({ error: 'Missing profile fields' });
            return;
        }
        const emailLower = user.email.toLowerCase().trim();
        const docRef = db.collection('users').doc(emailLower);
        user.name = name;
        user.stream = stream;
        user.targetPercentage = Number(targetPercentage);
        if (phone !== undefined) {
            user.phone = phone;
        }
        if (whatsappReminders !== undefined) {
            user.whatsappReminders = !!whatsappReminders;
        }
        await docRef.set(user);
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
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error during profile update' });
    }
});
// 7. whatsappLogs
exports.whatsappLogs = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    try {
        const token = req.headers['x-auth-token'];
        const user = await getAuthenticatedUser(token);
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const emailLower = user.email.toLowerCase().trim();
        const logsSnap = await db.collection('whatsappLogs')
            .where('email', '==', emailLower)
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();
        const logs = [];
        logsSnap.forEach(docSnap => {
            logs.push(docSnap.data());
        });
        res.json({ logs });
    }
    catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch WhatsApp logs' });
    }
});
// 8. whatsappTestSend
exports.whatsappTestSend = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    try {
        const token = req.headers['x-auth-token'];
        const user = await getAuthenticatedUser(token);
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { phone, message } = req.body;
        if (!phone || !message) {
            res.status(400).json({ error: 'Phone number and message are required' });
            return;
        }
        const emailLower = user.email.toLowerCase().trim();
        const logId = 'notif_manual_' + Math.random().toString(36).substring(2, 9);
        const newLog = {
            id: logId,
            email: emailLower,
            phone,
            message,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };
        await db.collection('whatsappLogs').doc(logId).set(newLog);
        res.json({ success: true, log: newLog });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to send test WhatsApp message' });
    }
});
// 9. whatsappSimulateAutoAll
exports.whatsappSimulateAutoAll = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    try {
        const token = req.headers['x-auth-token'];
        const user = await getAuthenticatedUser(token);
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!user.phone || !user.data || !Array.isArray(user.data.plannerActivities)) {
            res.status(400).json({ error: 'User does not have a phone number or planner activities set up yet.' });
            return;
        }
        const activities = user.data.plannerActivities;
        if (activities.length === 0) {
            res.status(400).json({ error: 'لا يوجد مهام مجدولة هذا الأسبوع لمحاكاتها!' });
            return;
        }
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        const batch = db.batch();
        let count = 0;
        for (const act of activities) {
            const dayName = days[act.dayOfWeek] || 'اليوم المجدول';
            const message = `🔔 [تنبيه تلقائي ذكي] تذكير منصة الثانوية العامة: حان الآن موعد ${act.title} يوم (${dayName}) من الساعة ${act.startTime} حتى ${act.endTime}. تذكر أن عقلنا البشري ينمو بالمثابرة والتركيز الفعال! 💪✨`;
            const logId = 'notif_sim_auto_' + Math.random().toString(36).substring(2, 9);
            const logDoc = db.collection('whatsappLogs').doc(logId);
            batch.set(logDoc, {
                id: logId,
                email: user.email.toLowerCase().trim(),
                phone: user.phone,
                message,
                timestamp: new Date().toISOString(),
                status: 'sent'
            });
            count++;
        }
        await batch.commit();
        res.json({ success: true, count });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to simulate automatic sends' });
    }
});
// 10. chat (Moallem AI)
exports.chat = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    try {
        const token = req.headers['x-auth-token'];
        const user = await getAuthenticatedUser(token);
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { message, history } = req.body;
        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }
        const studentStream = user.stream || 'science';
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
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
            try {
                const ai = new genai_1.GoogleGenAI({ apiKey });
                const chatContents = history ? history.map((h) => ({
                    role: h.role,
                    parts: [{ text: h.text }]
                })) : [];
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
                res.json({ text: textResponse });
                return;
            }
            catch (geminiError) {
                console.error('Gemini call failed, falling back to simulator:', geminiError);
            }
        }
        // Fallback Simulator mode
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
        }
        else if (msgLower.includes('flashcard') || msgLower.includes('فلش كارد') || msgLower.includes('بطاقات')) {
            reply = `عملتلك كروت استذكار (Flashcards) سريعة وممتازة لمراجعة أهم المفاهيم:

**البطاقة الأولى 💡**
*الوجه:* ما هو "مبدأ التكرار المتباعد" (Spaced Repetition) علمياً؟
*الظهر:* هو مراجعة المعلومة على فترات زمنية متزايدة (مثال: بعد يوم، ثم 3 أيام، ثم أسبوع، ثم شهر) للتغلب على منحنى النسيان الطبيعي وترسيخ المعلومة في الذاكرة طويلة المدى.

**البطاقة الثانية 💡**
*الوجه:* كيف تتجنب التشتت أثناء "العمل العميق" (Deep Work)؟
*الظهر:* بوضع الهاتف في غرفة أخرى تماماً، تشغيل مؤقت محدد (مثل 50 دقيقة تركيز)، والبدء بمهمة واحدة محددة مسبقاً لمنع استنزاف طاقة الانتباه (Attention Residue).

قولي حابب نعمل كروت لدرس معين في مادتك؟ اكتبلي اسم الدرس وهظبطهولك! 📲`;
        }
        else if (msgLower.includes('plan') || msgLower.includes('جدول') || msgLower.includes('خطة') || msgLower.includes('تنظيم')) {
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
        }
        else if (msgLower.includes('summarize') || msgLower.includes('ملخص') || msgLower.includes('تلخيص') || msgLower.includes('شرح')) {
            reply = `من عيوني! التلخيص الذكي بيعتمد على إيجاز الروابط المهمة. إليك تلخيصاً فائق التركيز لـ "منحنى النسيان وكيفية التغلب عليه":

- **المشكلة:** بنفقد حوالي 70% من أي درس جديد بنذاكره خلال 24 ساعة فقط لو مراجعناهوش!
- **الحل العصبي الخارق:**
  1. **المراجعة الأولى:** بعد 20 دقيقة (استدعاء سريع من الذاكرة).
  2. **المراجعة الثانية:** بعد 24 ساعة (حل سؤالين على الدرس).
  3. **المراجعة الثالثة:** بعد أسبوع (تصفح العناوين والخرائط الذهنية).
  4. **المراجعة الرابعة:** بعد شهر (حل امتحان شامل).
- **النتيجة:** تتحول المعلومة من ذاكرة مؤقتة ضعيفة إلى ذاكرة صلبة ممتدة لآخر العام!

ابعتلي أي فقرة أو درس حاسس إنه طويل، وهلخصهولك في نقط ذهبية تفهمها في دقيقتين! 📝✨`;
        }
        else {
            reply = `يا بطل ثانوية عامة! عاجبني جداً حماسك واجتهادك النهاردة. 🧠✨
بصفتي مستشارك الدراسي، أنا هنا علشان أسهل عليك الصعب. قولي حابب نعمل إيه دلوقتي؟
1) 📝 **شرح وتلخيص** لدرس صعب عليك ومحتاج تفهمه ببساطة.
2) 🙋 **كويز سريع وسؤالين** في النظام الحديث يثبتوا تركيزك.
3) 💡 **بطاقات استذكار (Flashcards)** سريعة وممتعة لسرعة الاستدعاء.
4) 📅 **خطة دراسية مخصصة** تلم بيها اللي فاتك من غير ضغط.

اكتبلي أنت محتاج إيه وهتلاقيني معاك خطوة بخطوة! 😉👏`;
        }
        res.json({ text: reply });
    }
    catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({ error: 'Server error during AI request' });
    }
});
//# sourceMappingURL=index.js.map