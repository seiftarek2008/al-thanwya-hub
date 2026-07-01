/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  stream: 'math' | 'science' | 'literature';
  targetPercentage: number;
  profilePicture?: string;
  createdAt: string;
  phone?: string;
  whatsappReminders?: boolean;
}

export interface Subject {
  id: string;
  name: string;
  color: string; // Hex or Tailwind color class
  icon: string;  // Lucide icon name
  totalMinutes: number;
  targetMinutesPerWeek: number;
  maxScore?: number;
  branches?: string[];
}

export type StudyMethod = 'Pomodoro' | 'Deep Work' | 'Revision' | 'Practice Questions';

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  duration: number; // in seconds
  method: StudyMethod;
  focusScore: number; // 0 to 100
  cognitiveEnergyBefore: number; // 0 to 100
  cognitiveEnergyAfter: number; // 0 to 100
  timestamp: string; // ISO string
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'done';
  deadline: string; // YYYY-MM-DD
  completedAt?: string; // ISO string
}

export interface Goal {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly';
  category: 'hours' | 'tasks';
  targetValue: number; // e.g., 4 hours, or 5 tasks
  currentValue: number;
  deadline: string; // YYYY-MM-DD
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  date: string; // YYYY-MM-DD
  score?: number; // actual grade
  totalScore: number; // max possible grade (e.g. 60 or 40 for Thanaweya Amma)
  preparationLevel: 'high' | 'medium' | 'low';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  type?: 'general' | 'quiz' | 'flashcard' | 'summary' | 'plan';
}

export interface NeuroscienceStats {
  burnoutRisk: 'low' | 'moderate' | 'high';
  breakRecommendations: string[];
  optimalStudyHours: string[];
  dailyCognitiveEnergy: number; // 0 to 100
  consistencyScore: number; // 0 to 100
  spacedRepetitionList: {
    subjectName: string;
    topicName: string;
    nextReviewDate: string; // YYYY-MM-DD
    intervalDays: number;
  }[];
}

export interface PlannerActivity {
  id: string;
  title: string;
  dayOfWeek: number; // 0 to 6 (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  priority: 'high' | 'medium' | 'low';
  category: 'Study' | 'Revision' | 'Homework' | 'Assignment' | 'Exam' | 'Health/Gym' | 'Family/Personal' | 'Free Time';
  subjectId?: string; // Optional linked subject
  reminder?: boolean;
  completed?: boolean;
  notes?: string;
  gradeScore?: number;
  gradeTotal?: number;
}

export interface SleepLog {
  id: string;
  date: string; // YYYY-MM-DD
  bedtime: string; // "HH:MM"
  waketime: string; // "HH:MM"
  durationHours: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ScreenTimeLog {
  id: string;
  date: string; // YYYY-MM-DD
  minutes: number;
}

export interface DailyCheckin {
  id: string;
  date: string; // YYYY-MM-DD
  focusLevel: number; // 1 to 5
  motivation: number; // 1 to 5
  stress: number; // 1 to 5
  fatigue: number; // 1 to 5
}

export interface GradeRecord {
  id: string;
  subjectId: string;
  category: 'Homework' | 'Quiz' | 'Exam' | 'Practice Test' | 'Assignment';
  title: string;
  score: number;
  totalScore: number;
  date: string; // YYYY-MM-DD
  weakChapters?: string[];
  strongChapters?: string[];
  branch?: string;
}

export interface AppStudyState {
  subjects: Subject[];
  sessions: StudySession[];
  tasks: Task[];
  goals: Goal[];
  exams: Exam[];
  chatHistory: ChatMessage[];
  stats: NeuroscienceStats;
  plannerActivities?: PlannerActivity[];
  sleepLogs?: SleepLog[];
  screenTimeLogs?: ScreenTimeLog[];
  dailyCheckins?: DailyCheckin[];
  grades?: GradeRecord[];
}
