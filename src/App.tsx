/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Timer as TimerIcon,
  CheckSquare,
  BookOpen,
  GraduationCap,
  BrainCircuit,
  Settings as SettingsIcon,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  User,
  Activity,
  Award,
  Lock,
  Mail,
  UserPlus,
  Cloud,
  Calendar,
  CalendarDays
} from 'lucide-react';

import { Subject, StudySession, Task, Goal, Exam, ChatMessage, NeuroscienceStats, AppStudyState, PlannerActivity } from './types';
import Timer from './components/Timer';
import AIChatbot from './components/AIChatbot';
import StatsDashboard from './components/StatsDashboard';
import TaskList from './components/TaskList';
import ExamsTracker from './components/ExamsTracker';
import NeurosciencePanel from './components/NeurosciencePanel';
import SettingsPanel from './components/SettingsPanel';
import SubjectsManager from './components/SubjectsManager';
import GoogleDrivePanel from './components/GoogleDrivePanel';
import WeeklyPlanner from './components/WeeklyPlanner';
import TodayTracker from './components/TodayTracker';

const getDefaultSubjects = (stream: 'math' | 'science' | 'literature'): Subject[] => {
  if (stream === 'math') {
    return [
      { id: 'sub_1', name: 'اللغة العربية (Arabic)', color: '#FF5733', icon: 'BookOpen', totalMinutes: 0, targetMinutesPerWeek: 300, maxScore: 80, branches: ['نحو', 'نصوص', 'بلاغة', 'أدب', 'قراءة وقصة'] },
      { id: 'sub_2', name: 'اللغة الإنجليزية الأولى (English)', color: '#33FF57', icon: 'Languages', totalMinutes: 0, targetMinutesPerWeek: 240, maxScore: 60, branches: ['قواعد (Grammar)', 'كلمات وقراءة (Vocabulary & Reading)', 'كتابة وتعبير (Writing)'] },
      { id: 'sub_3_pure', name: 'الرياضيات البحتة (Pure Mathematics)', color: '#3357FF', icon: 'Layers', totalMinutes: 0, targetMinutesPerWeek: 180, maxScore: 30, branches: ['تفاضل وتكامل', 'جبر وهندسة فراغية'] },
      { id: 'sub_3_applied', name: 'الرياضيات التطبيقية (Applied Mathematics)', color: '#3b82f6', icon: 'Compass', totalMinutes: 0, targetMinutesPerWeek: 180, maxScore: 30, branches: ['استاتيكا', 'ديناميكا'] },
      { id: 'sub_4', name: 'الفيزياء (Physics)', color: '#F3FF33', icon: 'Flame', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['تيار كهربي وكيرشوف', 'تأثير مغناطيسي وأجهزة', 'حث كهرومغناطيسي', 'تيار متردد', 'فيزياء حديثة'] },
      { id: 'sub_5', name: 'الكيمياء (Chemistry)', color: '#FF33F3', icon: 'FlaskConical', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['عناصر انتقالية', 'تحليل كيميائي', 'اتزان كيميائي', 'كيمياء كهربية', 'كيمياء عضوية'] }
    ];
  } else if (stream === 'science') {
    return [
      { id: 'sub_1', name: 'اللغة العربية (Arabic)', color: '#FF5733', icon: 'BookOpen', totalMinutes: 0, targetMinutesPerWeek: 300, maxScore: 80, branches: ['نحو', 'نصوص', 'بلاغة', 'أدب', 'قراءة وقصة'] },
      { id: 'sub_2', name: 'اللغة الإنجليزية الأولى (English)', color: '#33FF57', icon: 'Languages', totalMinutes: 0, targetMinutesPerWeek: 240, maxScore: 60, branches: ['قواعد (Grammar)', 'كلمات وقراءة (Vocabulary & Reading)', 'كتابة وتعبير (Writing)'] },
      { id: 'sub_3', name: 'الأحياء (Biology)', color: '#3357FF', icon: 'Layers', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['دعامة وحركة', 'تنسيق هرموني', 'تكاثر', 'مناعة', 'بيولوجيا جزيئية (DNA & RNA)'] },
      { id: 'sub_4', name: 'الفيزياء (Physics)', color: '#F3FF33', icon: 'Flame', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['تيار كهربي وكيرشوف', 'تأثير مغناطيسي وأجهزة', 'حث كهرومغناطيسي', 'تيار متردد', 'فيزياء حديثة'] },
      { id: 'sub_5', name: 'الكيمياء (Chemistry)', color: '#FF33F3', icon: 'FlaskConical', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['عناصر انتقالية', 'تحليل كيميائي', 'اتزان كيميائي', 'كيمياء كهربية', 'كيمياء عضوية'] }
    ];
  } else {
    return [
      { id: 'sub_1', name: 'اللغة العربية (Arabic)', color: '#FF5733', icon: 'BookOpen', totalMinutes: 0, targetMinutesPerWeek: 300, maxScore: 80, branches: ['نحو', 'نصوص', 'بلاغة', 'أدب', 'قراءة وقصة'] },
      { id: 'sub_2', name: 'اللغة الإنجليزية الأولى (English)', color: '#33FF57', icon: 'Languages', totalMinutes: 0, targetMinutesPerWeek: 240, maxScore: 60, branches: ['قواعد (Grammar)', 'كلمات وقراءة (Vocabulary & Reading)', 'كتابة وتعبير (Writing)'] },
      { id: 'sub_3', name: 'التاريخ (History)', color: '#3357FF', icon: 'Layers', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['الحملة الفرنسية', 'محمد علي وبناء مصر الحديثة', 'الثورة العرابية والاحتلال', 'مصر بعد الحرب العالمية الأولى', 'التوسع الاستعماري والتحرر', 'الحرب العالمية الثانية والمقاومة', 'ثورة 23 يوليو', 'الصراع العربي الإسرائيلي'] },
      { id: 'sub_4', name: 'الجغرافيا (Geography)', color: '#F3FF33', icon: 'Flame', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['مدخل الجغرافيا السياسية', 'الدولة', 'الحدود السياسية', 'المشكلات السياسية', 'التكتلات والأحلاف', 'النظام العالمي الجديد'] },
      { id: 'sub_5', name: 'علم النفس والاجتماع (Psychology)', color: '#FF33F3', icon: 'FlaskConical', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['الذكاء والتعلم', 'النمو والارتقاء', 'الشخصية وأساليب التوافق', 'العمليات المعرفية والظواهر', 'المشكلات الاجتماعية'] }
    ];
  }
};

export default function App() {
  // Auth states
  const [token, setToken] = useState<string | null>(localStorage.getItem('study_session_token'));
  const [user, setUser] = useState<{ name: string; email: string; stream: 'math' | 'science' | 'literature'; targetPercentage: number } | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Auth Form State
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authStream, setAuthStream] = useState<'math' | 'science' | 'literature'>('science');
  const [authTarget, setAuthTarget] = useState(95);
  const [authError, setAuthError] = useState('');

  // Main study records state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [neuroscienceStats, setNeuroscienceStats] = useState<NeuroscienceStats>({
    burnoutRisk: 'low',
    breakRecommendations: ['Take a 5-minute NSDR break', 'Walk for 5 minutes in sunlight'],
    optimalStudyHours: ['09:00 AM - 11:00 AM', '04:00 PM - 06:00 PM'],
    dailyCognitiveEnergy: 90,
    consistencyScore: 92,
    spacedRepetitionList: []
  });

  // Additional behavioral indicators & weekly planner states
  const [plannerActivities, setPlannerActivities] = useState<any[]>([]);
  const [sleepLogs, setSleepLogs] = useState<any[]>([]);
  const [screenTimeLogs, setScreenTimeLogs] = useState<any[]>([]);
  const [dailyCheckins, setDailyCheckins] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);

  // UI States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timer' | 'tasks' | 'subjects' | 'ai' | 'exams' | 'neuroscience' | 'settings' | 'drive' | 'planner' | 'today'>('today');
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('study_dark_mode') === 'true');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load User and App Data
  useEffect(() => {
    if (token) {
      loadUserData();
    }
  }, [token]);

  // Load theme preference
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('study_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Load state from DB (falling back to LocalStorage)
  const loadUserData = async () => {
    try {
      const res = await fetch('/api/study/data', {
        headers: { 'x-auth-token': token || '' }
      });
      const resData = await res.json();
      
      if (res.ok) {
        if (resData.user) {
          setUser(resData.user);
        }
        if (resData.data) {
          populateState(resData.data, resData.user?.stream);
        }
      } else {
        // Fallback to cache local replica if server data load fails (robust offline capability)
        const cached = localStorage.getItem(`study_cache_${token}`);
        if (cached) {
          populateState(JSON.parse(cached));
        }
      }
    } catch (e) {
      console.warn('Network offline, using local study replica cache.');
      const cached = localStorage.getItem(`study_cache_${token}`);
      if (cached) {
        populateState(JSON.parse(cached));
      }
    }
  };

  const populateState = (data: AppStudyState, userStream?: 'math' | 'science' | 'literature') => {
    const streamToUse = userStream || user?.stream || 'science';
    let loadedSubjects = data.subjects || [];

    // Auto-initialize if empty, or if they are "math" stream but still have the old "sub_3" Mathematics layout instead of "sub_3_pure" and "sub_3_applied"
    const hasOldMathSubject = streamToUse === 'math' && loadedSubjects.some(s => s.id === 'sub_3' && s.name.includes('الرياضيات'));

    if (loadedSubjects.length === 0 || hasOldMathSubject) {
      loadedSubjects = getDefaultSubjects(streamToUse);
      // Save this updated state back to persistence so we don't have to regenerate it next time!
      setTimeout(() => {
        syncStateWithStorage({ subjects: loadedSubjects });
      }, 500);
    }

    setSubjects(loadedSubjects);
    setSessions(data.sessions || []);
    setTasks(data.tasks || []);
    setGoals(data.goals || []);
    setExams(data.exams || []);
    setChatHistory(data.chatHistory || []);
    setPlannerActivities(data.plannerActivities || []);
    setSleepLogs(data.sleepLogs || []);
    setScreenTimeLogs(data.screenTimeLogs || []);
    setDailyCheckins(data.dailyCheckins || []);
    setGrades(data.grades || []);
    if (data.stats) {
      setNeuroscienceStats(data.stats);
    }
  };

  // Synchronize state back to server and write cache replica
  const syncStateWithStorage = async (updatedData: Partial<AppStudyState>) => {
    const fullState: AppStudyState = {
      subjects: updatedData.subjects ?? subjects,
      sessions: updatedData.sessions ?? sessions,
      tasks: updatedData.tasks ?? tasks,
      goals: updatedData.goals ?? goals,
      exams: updatedData.exams ?? exams,
      chatHistory: updatedData.chatHistory ?? chatHistory,
      stats: updatedData.stats ?? neuroscienceStats,
      plannerActivities: updatedData.plannerActivities ?? plannerActivities,
      sleepLogs: updatedData.sleepLogs ?? sleepLogs,
      screenTimeLogs: updatedData.screenTimeLogs ?? screenTimeLogs,
      dailyCheckins: updatedData.dailyCheckins ?? dailyCheckins,
      grades: updatedData.grades ?? grades
    };

    // Save to local cache replica instantly
    localStorage.setItem(`study_cache_${token}`, JSON.stringify(fullState));

    // Async push to full Express DB backend
    if (token) {
      try {
        await fetch('/api/study/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify({ data: fullState })
        });
      } catch (e) {
        console.warn('Could not sync with server DB, queued backup.');
      }
    }
  };

  // Auth Action Handlers
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authName,
          email: authEmail,
          password: authPassword,
          stream: authStream,
          targetPercentage: authTarget
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('study_session_token', data.token);
        setToken(data.token);
        setUser(data.user);
      } else {
        setAuthError(data.error || 'فشلت عملية التسجيل');
      }
    } catch (err) {
      setAuthError('حدث عطل بالشبكة أو الخادم');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('study_session_token', data.token);
        setToken(data.token);
        setUser(data.user);
      } else {
        setAuthError(data.error || 'خطأ في البريد أو كلمة المرور');
      }
    } catch (err) {
      setAuthError('حدث عطل بالشبكة أو الخادم');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, newPassword: authPassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert('تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بالرمز الجديد.');
        setAuthMode('login');
      } else {
        setAuthError(data.error || 'فشلت إعادة التعيين');
      }
    } catch (err) {
      setAuthError('حدث عطل بالشبكة');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('study_session_token');
    setToken(null);
    setUser(null);
    populateState({
      subjects: [],
      sessions: [],
      tasks: [],
      goals: [],
      exams: [],
      chatHistory: [],
      stats: {
        burnoutRisk: 'low',
        breakRecommendations: [],
        optimalStudyHours: [],
        dailyCognitiveEnergy: 100,
        consistencyScore: 100,
        spacedRepetitionList: []
      }
    });
  };

  // State modification triggers with automated syncing
  const handleAddSubject = (newSub: Omit<Subject, 'id' | 'totalMinutes'>) => {
    const id = 'sub_' + Math.random().toString(36).substring(2, 9);
    const added: Subject = { ...newSub, id, totalMinutes: 0 };
    const list = [...subjects, added];
    setSubjects(list);
    syncStateWithStorage({ subjects: list });
  };

  const handleEditSubject = (id: string, updated: Partial<Subject>) => {
    const list = subjects.map((sub) => (sub.id === id ? { ...sub, ...updated } : sub));
    setSubjects(list);
    syncStateWithStorage({ subjects: list });
  };

  const handleDeleteSubject = (id: string) => {
    const list = subjects.filter((sub) => sub.id !== id);
    setSubjects(list);
    syncStateWithStorage({ subjects: list });
  };

  const handleResetSubjectsToDefault = () => {
    const defaultList = getDefaultSubjects(user?.stream || 'science');
    setSubjects(defaultList);
    syncStateWithStorage({ subjects: defaultList });
  };

  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    const id = 'task_' + Math.random().toString(36).substring(2, 9);
    const added: Task = { ...newTask, id };
    const list = [...tasks, added];
    setTasks(list);
    syncStateWithStorage({ tasks: list });
  };

  const handleToggleTask = (id: string) => {
    const list = tasks.map((t) =>
      t.id === id
        ? { ...t, status: (t.status === 'todo' ? 'done' : 'todo') as any, completedAt: t.status === 'todo' ? new Date().toISOString() : undefined }
        : t
    );
    setTasks(list);
    syncStateWithStorage({ tasks: list });
  };

  const handleDeleteTask = (id: string) => {
    const list = tasks.filter((t) => t.id !== id);
    setTasks(list);
    syncStateWithStorage({ tasks: list });
  };

  const handleAddExam = (newExam: Omit<Exam, 'id'>) => {
    const id = 'exam_' + Math.random().toString(36).substring(2, 9);
    const added: Exam = { ...newExam, id };
    const list = [...exams, added];
    setExams(list);
    syncStateWithStorage({ exams: list });
  };

  const handleRecordExamGrade = (id: string, score: number) => {
    const list = exams.map((e) => (e.id === id ? { ...e, score } : e));
    setExams(list);
    syncStateWithStorage({ exams: list });
  };

  const handleDeleteExam = (id: string) => {
    const list = exams.filter((e) => e.id !== id);
    setExams(list);
    syncStateWithStorage({ exams: list });
  };

  const handleAddSleepLog = (log: any) => {
    const id = 'sleep_' + Math.random().toString(36).substring(2, 9);
    const list = [...sleepLogs, { ...log, id }];
    setSleepLogs(list);
    syncStateWithStorage({ sleepLogs: list });
  };

  const handleAddScreenTimeLog = (log: any) => {
    const id = 'screen_' + Math.random().toString(36).substring(2, 9);
    const list = [...screenTimeLogs, { ...log, id }];
    setScreenTimeLogs(list);
    syncStateWithStorage({ screenTimeLogs: list });
  };

  const handleAddDailyCheckin = (checkin: any) => {
    const id = 'checkin_' + Math.random().toString(36).substring(2, 9);
    const list = [...dailyCheckins, { ...checkin, id }];
    setDailyCheckins(list);
    syncStateWithStorage({ dailyCheckins: list });
  };

  const handleAddGrade = (grade: any) => {
    const id = 'grade_' + Math.random().toString(36).substring(2, 9);
    const list = [...grades, { ...grade, id }];
    setGrades(list);
    syncStateWithStorage({ grades: list });
  };

  const handleDeleteGrade = (id: string) => {
    const list = grades.filter((g) => g.id !== id);
    setGrades(list);
    syncStateWithStorage({ grades: list });
  };

  const handleAddPlannerActivity = (activity: any) => {
    const id = 'act_' + Math.random().toString(36).substring(2, 9);
    const list = [...plannerActivities, { ...activity, id }];
    setPlannerActivities(list);
    syncStateWithStorage({ plannerActivities: list });
  };

  const handleDeletePlannerActivity = (id: string) => {
    const list = plannerActivities.filter((act) => act.id !== id);
    setPlannerActivities(list);
    syncStateWithStorage({ plannerActivities: list });
  };

  const handleUpdatePlannerActivity = (updatedActivity: PlannerActivity) => {
    const list = plannerActivities.map((act) => act.id === updatedActivity.id ? updatedActivity : act);
    setPlannerActivities(list);
    syncStateWithStorage({ plannerActivities: list });
  };

  const handleOptimizeSchedule = (optimizedList: any[]) => {
    setPlannerActivities(optimizedList);
    syncStateWithStorage({ plannerActivities: optimizedList });
  };

  const handleTogglePlannerActivityCompletion = (id: string, updates?: Partial<PlannerActivity>) => {
    const list = plannerActivities.map((act) =>
      act.id === id
        ? { ...act, completed: !act.completed, ...updates }
        : act
    );
    setPlannerActivities(list);
    syncStateWithStorage({ plannerActivities: list });
  };

  // Complete study session from Timer
  const handleSessionComplete = (session: {
    subjectId: string;
    subjectName: string;
    duration: number;
    method: any;
    focusScore: number;
  }) => {
    const id = 'session_' + Math.random().toString(36).substring(2, 9);
    const completedSession: StudySession = {
      ...session,
      id,
      cognitiveEnergyBefore: neuroscienceStats.dailyCognitiveEnergy,
      cognitiveEnergyAfter: Math.max(neuroscienceStats.dailyCognitiveEnergy - 15, 20),
      timestamp: new Date().toISOString()
    };

    // Update subject accumulated minutes
    const updatedSubjects = subjects.map((sub) =>
      sub.id === session.subjectId
        ? { ...sub, totalMinutes: sub.totalMinutes + Math.round(session.duration / 60) }
        : sub
    );

    const updatedSessions = [...sessions, completedSession];
    
    // Recalculate daily cognitive energy and consistency
    const nextEnergy = Math.max(neuroscienceStats.dailyCognitiveEnergy - 10, 30);
    const nextStats = {
      ...neuroscienceStats,
      dailyCognitiveEnergy: nextEnergy,
      consistencyScore: Math.min(neuroscienceStats.consistencyScore + 2, 100)
    };

    setSubjects(updatedSubjects);
    setSessions(updatedSessions);
    setNeuroscienceStats(nextStats);

    syncStateWithStorage({
      subjects: updatedSubjects,
      sessions: updatedSessions,
      stats: nextStats
    });
  };

  // AI Chat Messenger Proxy handler
  const handleSendMessageToAI = async (message: string): Promise<string> => {
    const userMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      role: 'user',
      text: message,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || ''
        },
        body: JSON.stringify({ message, history: chatHistory })
      });
      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: 'msg_' + Math.random().toString(36).substring(2, 9),
        role: 'model',
        text: data.text || 'أهلاً بك يا بطل! أعد المحاولة مجدداً.',
        timestamp: new Date().toISOString()
      };

      const finalHistory = [...newHistory, botMsg];
      setChatHistory(finalHistory);
      syncStateWithStorage({ chatHistory: finalHistory });

      return botMsg.text;
    } catch (e) {
      console.error('AI call failed:', e);
      return 'عذراً يا بطل، حدث خطأ في الاتصال بالخادم. حاول مجدداً.';
    }
  };

  const handleUpdateProfile = async (profile: { name: string; stream: 'math' | 'science' | 'literature'; targetPercentage: number; phone?: string; whatsappReminders?: boolean }) => {
    try {
      const oldStream = user?.stream;
      setUser({ ...user!, ...profile });

      if (profile.stream !== oldStream) {
        // Generate and set default subjects for the new stream dynamically
        let newDefaultSubjects: Subject[] = [];
        if (profile.stream === 'math') {
          newDefaultSubjects = [
            { id: 'sub_1', name: 'اللغة العربية (Arabic)', color: '#FF5733', icon: 'BookOpen', totalMinutes: 0, targetMinutesPerWeek: 300, maxScore: 80, branches: ['نحو', 'نصوص', 'بلاغة', 'أدب', 'قراءة وقصة'] },
            { id: 'sub_2', name: 'اللغة الإنجليزية الأولى (English)', color: '#33FF57', icon: 'Languages', totalMinutes: 0, targetMinutesPerWeek: 240, maxScore: 60, branches: ['قواعد (Grammar)', 'كلمات وقراءة (Vocabulary & Reading)', 'كتابة وتعبير (Writing)'] },
            { id: 'sub_3_pure', name: 'الرياضيات البحتة (Pure Mathematics)', color: '#3357FF', icon: 'Layers', totalMinutes: 0, targetMinutesPerWeek: 180, maxScore: 30, branches: ['تفاضل وتكامل', 'جبر وهندسة فراغية'] },
            { id: 'sub_3_applied', name: 'الرياضيات التطبيقية (Applied Mathematics)', color: '#3b82f6', icon: 'Compass', totalMinutes: 0, targetMinutesPerWeek: 180, maxScore: 30, branches: ['استاتيكا', 'ديناميكا'] },
            { id: 'sub_4', name: 'الفيزياء (Physics)', color: '#F3FF33', icon: 'Flame', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['تيار كهربي وكيرشوف', 'تأثير مغناطيسي وأجهزة', 'حث كهرومغناطيسي', 'تيار متردد', 'فيزياء حديثة'] },
            { id: 'sub_5', name: 'الكيمياء (Chemistry)', color: '#FF33F3', icon: 'FlaskConical', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['عناصر انتقالية', 'تحليل كيميائي', 'اتزان كيميائي', 'كيمياء كهربية', 'كيمياء عضوية'] }
          ];
        } else if (profile.stream === 'science') {
          newDefaultSubjects = [
            { id: 'sub_1', name: 'اللغة العربية (Arabic)', color: '#FF5733', icon: 'BookOpen', totalMinutes: 0, targetMinutesPerWeek: 300, maxScore: 80, branches: ['نحو', 'نصوص', 'بلاغة', 'أدب', 'قراءة وقصة'] },
            { id: 'sub_2', name: 'اللغة الإنجليزية الأولى (English)', color: '#33FF57', icon: 'Languages', totalMinutes: 0, targetMinutesPerWeek: 240, maxScore: 60, branches: ['قواعد (Grammar)', 'كلمات وقراءة (Vocabulary & Reading)', 'كتابة وتعبير (Writing)'] },
            { id: 'sub_3', name: 'الأحياء (Biology)', color: '#3357FF', icon: 'Layers', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['دعامة وحركة', 'تنسيق هرموني', 'تكاثر', 'مناعة', 'بيولوجيا جزيئية (DNA & RNA)'] },
            { id: 'sub_4', name: 'الفيزياء (Physics)', color: '#F3FF33', icon: 'Flame', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['تيار كهربي وكيرشوف', 'تأثير مغناطيسي وأجهزة', 'حث كهرومغناطيسي', 'تيار متردد', 'فيزياء حديثة'] },
            { id: 'sub_5', name: 'الكيمياء (Chemistry)', color: '#FF33F3', icon: 'FlaskConical', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['عناصر انتقالية', 'تحليل كيميائي', 'اتزان كيميائي', 'كيمياء كهربية', 'كيمياء عضوية'] }
          ];
        } else if (profile.stream === 'literature') {
          newDefaultSubjects = [
            { id: 'sub_1', name: 'اللغة العربية (Arabic)', color: '#FF5733', icon: 'BookOpen', totalMinutes: 0, targetMinutesPerWeek: 300, maxScore: 80, branches: ['نحو', 'نصوص', 'بلاغة', 'أدب', 'قراءة وقصة'] },
            { id: 'sub_2', name: 'اللغة الإنجليزية الأولى (English)', color: '#33FF57', icon: 'Languages', totalMinutes: 0, targetMinutesPerWeek: 240, maxScore: 60, branches: ['قواعد (Grammar)', 'كلمات وقراءة (Vocabulary & Reading)', 'كتابة وتعبير (Writing)'] },
            { id: 'sub_3', name: 'التاريخ (History)', color: '#3357FF', icon: 'Layers', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['الحملة الفرنسية', 'محمد علي وبناء مصر الحديثة', 'الثورة العرابية والاحتلال', 'مصر بعد الحرب العالمية الأولى', 'التوسع الاستعماري والتحرر', 'الحرب العالمية الثانية والمقاومة', 'ثورة 23 يوليو', 'الصراع العربي الإسرائيلي'] },
            { id: 'sub_4', name: 'الجغرافيا (Geography)', color: '#F3FF33', icon: 'Flame', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['مدخل الجغرافيا السياسية', 'الدولة', 'الحدود السياسية', 'المشكلات السياسية', 'التكتلات والأحلاف', 'النظام العالمي الجديد'] },
            { id: 'sub_5', name: 'علم النفس والاجتماع (Psychology)', color: '#FF33F3', icon: 'FlaskConical', totalMinutes: 0, targetMinutesPerWeek: 360, maxScore: 60, branches: ['الذكاء والتعلم', 'النمو والارتقاء', 'الشخصية وأساليب التوافق', 'العمليات المعرفية والظواهر', 'المشكلات الاجتماعية'] }
          ];
        }
        setSubjects(newDefaultSubjects);
        syncStateWithStorage({ subjects: newDefaultSubjects });
      }

      if (token) {
        await fetch('/api/user/update-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(profile)
        });
      }
    } catch (e) {
      console.error('Failed to update profile:', e);
    }
  };

  const handleUpdatePassword = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, newPassword: password })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  };

  // Study Streak Calculation
  const studyStreak = useMemo(() => {
    if (sessions.length === 0) return 0;
    // Simple calculation: count consecutive days starting from today or yesterday
    const uniqueDays = Array.from(
      new Set(sessions.map((s) => s.timestamp.split('T')[0]))
    ).sort().reverse() as string[];
    
    if (uniqueDays.length === 0) return 0;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (uniqueDays[0] !== todayStr && uniqueDays[0] !== yesterdayStr) {
      return 0; // streak broken
    }

    let streakCount = 1;
    for (let i = 0; i < uniqueDays.length - 1; i++) {
      const current = new Date(uniqueDays[i]);
      const prev = new Date(uniqueDays[i + 1]);
      const diffTime = Math.abs(current.getTime() - prev.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streakCount++;
      } else if (diffDays > 1) {
        break;
      }
    }
    return streakCount;
  }, [sessions]);

  // Auth gate rendering
  if (!token) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 font-sans transition-colors duration-300`}>
        <div className="w-full max-w-md p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl text-right" style={{ direction: 'rtl' }}>
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 rounded-2xl mx-auto flex items-center justify-center shadow-md mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">مساعد دراسة ثانوية عامة دفعة ٢٠٢٧ 🎓</h2>
            <p className="text-xs text-zinc-500 mt-1.5 dark:text-zinc-400">النظام الجديد المعدّل (المجموع من ٣٢٠ درجة) - مبني على أسس علم الأعصاب للتفوق</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold">
              {authError}
            </div>
          )}

          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">البريد الإلكتروني للجروب المغلق:</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-2.5 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="student@group.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">رمز المرور الخاص بك:</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-2.5 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs mt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                >
                  نسيت رمز المرور؟
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 font-semibold rounded-xl text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md transition-colors"
              >
                تسجيل الدخول للمجموعة المغلقة
              </button>

              <p className="text-xs text-center text-zinc-500 mt-4">
                ليس لديك حساب بعد؟{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-zinc-950 dark:text-zinc-50 font-bold hover:underline"
                >
                  انضم وسجل حساب جديد
                </button>
              </p>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">اسم الطالب بالكامل:</label>
                <div className="relative">
                  <User className="absolute right-3 top-2.5 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="محمد أحمد علي"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">البريد الإلكتروني:</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-2.5 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="student@group.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">رمز المرور الخاص بك:</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-2.5 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">الشعبة الدراسية:</label>
                  <select
                    value={authStream}
                    onChange={(e) => setAuthStream(e.target.value as any)}
                    className="w-full px-2 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="science">علمي علوم 🧪</option>
                    <option value="math">علمي رياضة 📐</option>
                    <option value="literature">أدبي 📚</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">المجموع المستهدف (%):</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={authTarget}
                    onChange={(e) => setAuthTarget(Number(e.target.value))}
                    className="w-full px-2 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 font-semibold rounded-xl text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md transition-colors"
              >
                تسجيل العضوية الجديدة
              </button>

              <p className="text-xs text-center text-zinc-500 mt-2">
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-zinc-950 dark:text-zinc-50 font-bold hover:underline"
                >
                  تسجيل الدخول من هنا
                </button>
              </p>
            </form>
          )}

          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                تعديل كلمة المرور للجروب المغلق: أدخل بريدك الإلكتروني والرمز الجديد لتحديثه فوراً.
              </p>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">البريد الإلكتروني:</label>
                <input
                  type="email"
                  required
                  placeholder="student@group.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">كلمة المرور الجديدة:</label>
                <input
                  type="password"
                  required
                  placeholder="رمز جديد قوية"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 font-semibold rounded-xl text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md"
              >
                تحديث رمز المرور
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="w-full text-xs text-center text-zinc-500 hover:underline hover:text-zinc-800 dark:hover:text-zinc-300 block"
              >
                رجوع لتسجيل الدخول
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Study Dashboard Workspace Layout
  const userStreamLabel = user?.stream === 'math' ? 'علمي رياضة' : user?.stream === 'science' ? 'علمي علوم' : 'أدبي';

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-64 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col justify-between`}
      >
        <div>
          {/* Brand logo */}
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-right w-full">
              <div className="p-2 rounded-xl bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight">مساعد ثانوية عامة</h1>
                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded font-semibold">المجموعة المغلقة</span>
              </div>
            </div>
          </div>

          {/* Student Status Profile quick widget */}
          <div className="p-4 mx-4 my-4 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30 text-right dir-rtl">
            <span className="text-[10px] text-zinc-400 block">طالب مجتهد</span>
            <strong className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">{user?.name || 'طالب ثانوية'}</strong>
            <span className="text-[9px] text-zinc-500 mt-1 block">الشعبة: {userStreamLabel} | المستهدف: {user?.targetPercentage || 95}%</span>
          </div>

          {/* Nav Items */}
          <nav className="px-3 space-y-1">
            {[
              { id: 'today', label: 'متابعة جدول اليوم والواتساب 📅', icon: CalendarDays },
              { id: 'dashboard', label: 'لوحة التحكم والمؤشرات', icon: LayoutDashboard },
              { id: 'timer', label: 'مؤقت التركيز الذكي', icon: TimerIcon },
              { id: 'planner', label: 'المنظم والجدول الأسبوعي', icon: Calendar },
              { id: 'tasks', label: 'جدول المهام الأسبوعي', icon: CheckSquare },
              { id: 'subjects', label: 'إدارة وتخصيص المواد', icon: BookOpen },
              { id: 'ai', label: 'مستشار الذكاء الاصطناعي', icon: Sparkles },
              { id: 'exams', label: 'متابعة الامتحانات والدرجات', icon: GraduationCap },
              { id: 'neuroscience', label: 'صحة الدماغ وعلم الأعصاب', icon: BrainCircuit },
              { id: 'drive', label: 'مستودع المذاكرة السحابي (Drive)', icon: Cloud },
              { id: 'settings', label: 'إعدادات الملف الدراسي', icon: SettingsIcon }
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    // On mobile, auto-close sidebar on navigate
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-zinc-950 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950 shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <IconComp className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout / Settings */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-2">
            {/* Toggle sidebar button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 md:hidden transition-colors"
            >
              <Activity className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Day/Night Toggler */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              title="تغيير المظهر البصري"
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Dynamic Online/Offline Sync Status Indicator */}
            <div className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-xl font-medium transition-all ${
              isOnline 
                ? 'text-zinc-500 border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900' 
                : 'text-amber-600 border-amber-250 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/25'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-bounce'}`}></span>
              <span>{isOnline ? 'مزامنة سحابية نشطة' : 'وضع غير متصل - حفظ تلقائي محلي'}</span>
            </div>
          </div>
        </header>

        {/* Tab Canvas Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto w-full">
          {activeTab === 'today' && user && (
            <TodayTracker
              user={user as any}
              activities={plannerActivities}
              subjects={subjects}
              onToggleActivityCompletion={handleTogglePlannerActivityCompletion}
              onUpdateProfile={handleUpdateProfile}
              onAddGrade={handleAddGrade}
            />
          )}

          {activeTab === 'dashboard' && (
            <StatsDashboard
              subjects={subjects}
              sessions={sessions}
              tasks={tasks}
              streak={studyStreak}
              exams={exams}
              grades={grades}
            />
          )}

          {activeTab === 'timer' && (
            <div className="max-w-md mx-auto">
              <Timer
                subjects={subjects}
                onSessionComplete={handleSessionComplete}
              />
            </div>
          )}

          {activeTab === 'tasks' && (
            <TaskList
              tasks={tasks}
              subjects={subjects}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectsManager
              subjects={subjects}
              onAddSubject={handleAddSubject}
              onEditSubject={handleEditSubject}
              onDeleteSubject={handleDeleteSubject}
              onResetSubjects={handleResetSubjectsToDefault}
            />
          )}

          {activeTab === 'ai' && (
            <AIChatbot
              chatHistory={chatHistory}
              onSendMessage={handleSendMessageToAI}
            />
          )}

          {activeTab === 'exams' && (
            <ExamsTracker
              exams={exams}
              subjects={subjects}
              onAddExam={handleAddExam}
              onRecordGrade={handleRecordExamGrade}
              onDeleteExam={handleDeleteExam}
              consistencyScore={neuroscienceStats.consistencyScore}
            />
          )}

          {activeTab === 'neuroscience' && (
            <NeurosciencePanel
              stream={user?.stream || 'science'}
              consistencyScore={neuroscienceStats.consistencyScore}
              subjects={subjects}
              sleepLogs={sleepLogs}
              screenTimeLogs={screenTimeLogs}
              dailyCheckins={dailyCheckins}
              grades={grades}
              plannerActivities={plannerActivities}
              onAddSleepLog={handleAddSleepLog}
              onAddScreenTimeLog={handleAddScreenTimeLog}
              onAddDailyCheckin={handleAddDailyCheckin}
              onAddGrade={handleAddGrade}
              onDeleteGrade={handleDeleteGrade}
            />
          )}

          {activeTab === 'planner' && (
            <WeeklyPlanner
              activities={plannerActivities}
              subjects={subjects}
              onAddActivity={handleAddPlannerActivity}
              onDeleteActivity={handleDeletePlannerActivity}
              onUpdateActivity={handleUpdatePlannerActivity}
              onOptimizeSchedule={handleOptimizeSchedule}
            />
          )}

          {activeTab === 'drive' && (
            <GoogleDrivePanel
              appData={{ subjects, sessions, tasks, goals, exams, chatHistory, stats: neuroscienceStats }}
              onRestoreState={(restoredData) => {
                populateState(restoredData);
                syncStateWithStorage(restoredData);
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPanel
              user={user || { name: 'طالب', email: '', stream: 'science', targetPercentage: 95 }}
              appData={{ subjects, sessions, tasks, goals, exams, chatHistory, stats: neuroscienceStats, plannerActivities, sleepLogs, screenTimeLogs, dailyCheckins, grades }}
              onUpdateProfile={handleUpdateProfile}
              onUpdatePassword={handleUpdatePassword}
              onImportData={(importedData) => {
                populateState(importedData);
                syncStateWithStorage(importedData);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
