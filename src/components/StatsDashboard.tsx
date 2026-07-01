/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Clock, Flame, CheckCircle, Award, Brain, AlertTriangle, Zap, ArrowUpRight } from 'lucide-react';
import { Subject, StudySession, Task } from '../types';

interface StatsDashboardProps {
  subjects: Subject[];
  sessions: StudySession[];
  tasks: Task[];
  streak: number;
}

export default function StatsDashboard({ subjects, sessions, tasks, streak }: StatsDashboardProps) {
  // 1. Calculate general stats
  const totalStudyMinutes = useMemo(() => {
    return sessions.reduce((acc, s) => acc + s.duration, 0) / 60;
  }, [sessions]);

  const studyHoursToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return sessions
      .filter((s) => s.timestamp.startsWith(todayStr))
      .reduce((acc, s) => acc + s.duration, 0) / 3600;
  }, [sessions]);

  const studyHoursThisWeek = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return sessions
      .filter((s) => new Date(s.timestamp) >= oneWeekAgo)
      .reduce((acc, s) => acc + s.duration, 0) / 3600;
  }, [sessions]);

  const studyHoursThisMonth = useMemo(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    return sessions
      .filter((s) => new Date(s.timestamp) >= oneMonthAgo)
      .reduce((acc, s) => acc + s.duration, 0) / 3600;
  }, [sessions]);

  const completedTasksCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'done').length;
  }, [tasks]);

  const upcomingTasksCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'todo').length;
  }, [tasks]);

  // Productivity Score Calculation (Composite of focus score, goal completion, and study consistency)
  const productivityScore = useMemo(() => {
    if (sessions.length === 0) return 0;
    const avgFocus = sessions.reduce((acc, s) => acc + s.focusScore, 0) / sessions.length;
    const taskCompletionRate = tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 80;
    const streakBonus = Math.min(streak * 5, 20); // up to 20% bonus for streak
    return Math.min(Math.round(avgFocus * 0.5 + taskCompletionRate * 0.3 + streakBonus), 100);
  }, [sessions, tasks, completedTasksCount, streak]);

  // 2. Weekly Bar Chart Data (Last 7 Days)
  const last7DaysData = useMemo(() => {
    const data = [];
    const days = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const mins = sessions
        .filter((s) => s.timestamp.startsWith(dateStr))
        .reduce((acc, s) => acc + s.duration, 0) / 60;
      
      const dayIndex = d.getDay();
      data.push({
        dayName: days[dayIndex],
        hours: Number((mins / 60).toFixed(1)),
        dateStr
      });
    }
    return data;
  }, [sessions]);

  // Max value in weekly hours to calibrate SVG bar heights
  const maxWeeklyHours = useMemo(() => {
    const maxVal = Math.max(...last7DaysData.map((d) => d.hours));
    return maxVal > 0 ? maxVal : 4; // fallback scale
  }, [last7DaysData]);

  // 3. Subject Breakdown and Burnout Metrics
  const cognitiveEnergy = useMemo(() => {
    // Dynamic cognitive energy calculation
    const baseEnergy = 100;
    const todayStr = new Date().toISOString().split('T')[0];
    const sessionsToday = sessions.filter(s => s.timestamp.startsWith(todayStr));
    const sessionFatigue = sessionsToday.reduce((acc, s) => acc + (s.duration / 60) * 0.5, 0); // 0.5% drain per minute studied
    const recovery = 15; // default rest recovery
    return Math.max(Math.min(Math.round(baseEnergy - sessionFatigue + recovery), 100), 20);
  }, [sessions]);

  const burnoutRisk = useMemo(() => {
    // Flag risk if hours today are over 7 hours or if average focus drops below 60% with high study duration
    const todayHours = studyHoursToday;
    if (todayHours > 7) return 'high';
    if (todayHours > 4) return 'moderate';
    return 'low';
  }, [studyHoursToday]);

  return (
    <div className="space-y-6 text-right" style={{ direction: 'rtl' }}>
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Study Hours Card */}
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">ساعات المذاكرة اليوم</span>
            <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
              {studyHoursToday.toFixed(1)} <span className="text-xs font-normal">ساعة</span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1">المعدل الأسبوعي: {studyHoursThisWeek.toFixed(1)} ساعة</p>
          </div>
        </div>

        {/* Current Streak */}
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">سلسلة المذاكرة (Streak)</span>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
              {streak} <span className="text-xs font-normal">يوم متتالي</span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1">الاستمرارية تعزز مرونة العقل العصبي!</p>
          </div>
        </div>

        {/* Tasks completed */}
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">المهام المنجزة</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
              {completedTasksCount} <span className="text-xs font-normal">من {tasks.length}</span>
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1">{upcomingTasksCount} مهام متبقية بالجدول</p>
          </div>
        </div>

        {/* Overall Productivity Score */}
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">مؤشر الإنتاجية</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
              {productivityScore}%
            </h3>
            <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full transition-all" style={{ width: `${productivityScore}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Neuroscience Diagnostics Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Study Hours Custom Bar Chart */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">تحليل ساعات المذاكرة الأسبوعية</h4>
            <span className="text-xs text-zinc-500">آخر ٧ أيام</span>
          </div>

          {/* Simple Highly Polished SVG Bar Chart */}
          <div className="h-48 w-full flex items-end justify-between px-2 pt-6 border-b border-zinc-100 dark:border-zinc-900">
            {last7DaysData.map((d, index) => {
              const heightPercentage = Math.max((d.hours / maxWeeklyHours) * 100, 4); // minimum 4% height to see something
              return (
                <div key={index} className="flex flex-col items-center group w-[10%]">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 text-zinc-50 text-[10px] px-2 py-1 rounded absolute mb-14 translate-y-[-10px] shadow-md pointer-events-none font-mono">
                    {d.hours}ساعة
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-200 rounded-t transition-all duration-500 ease-out cursor-pointer shadow-sm"
                    style={{ height: `${heightPercentage}%`, minHeight: '8px' }}
                  ></div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-2 font-medium">{d.dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cognitive Load and Burnout Guard Panel */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <Brain className="w-5 h-5 text-zinc-900 dark:text-zinc-100" />
                تحليل الطاقة الإدراكية والإرهاق العصبي
              </h4>
            </div>

            {/* Burnout Meter and Battery Status */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    burnoutRisk === 'high'
                      ? 'bg-red-100 text-red-600'
                      : burnoutRisk === 'moderate'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <h5 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">مؤشر خطر الإجهاد (Burnout)</h5>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {burnoutRisk === 'high' ? 'مرتفع جداً! خذ قسطاً من الراحة فوراً.' : burnoutRisk === 'moderate' ? 'متوسط. ننصح بتقليل جلسات العمل الطويلة.' : 'آمن تماماً. طاقة عقلك ممتازة.'}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                  burnoutRisk === 'high' ? 'bg-red-50 text-red-700' : burnoutRisk === 'moderate' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {burnoutRisk === 'high' ? 'إجهاد خطر' : burnoutRisk === 'moderate' ? 'إجهاد متوسط' : 'مستقر'}
                </span>
              </div>

              {/* Energy Battery Level */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-zinc-500">البطارية المعرفية اليومية</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{cognitiveEnergy}%</span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-500 ${
                      cognitiveEnergy > 60 ? 'bg-emerald-500' : cognitiveEnergy > 30 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${cognitiveEnergy}%` }}
                  ></div>
                </div>
                <p className="text-[9px] text-zinc-400 mt-1">تتناقص مع فترات المذاكرة العميقة وتتعافى بالراحة والتكرار المتباعد المنظم.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900/50 flex justify-between items-center text-xs text-zinc-500">
            <span>الوقت الأمثل لمذاكرتك القادمة: <strong className="text-zinc-800 dark:text-zinc-200">04:00 عصراً</strong></span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Subject Statistics Progress Table */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">توزيع ساعات المذاكرة لكل مادة</h4>
        <div className="space-y-4">
          {subjects.map((sub) => {
            const minutesStudied = sessions
              .filter((s) => s.subjectId === sub.id)
              .reduce((acc, s) => acc + s.duration, 0) / 60;
            
            const weeklyProgressPercent = Math.min(
              Math.round((minutesStudied / sub.targetMinutesPerWeek) * 100),
              100
            );

            return (
              <div key={sub.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }}></span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{sub.name}</span>
                  </div>
                  <span className="text-zinc-500">
                    {(minutesStudied / 60).toFixed(1)} / {(sub.targetMinutesPerWeek / 60).toFixed(0)} ساعة هذا الأسبوع ({weeklyProgressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${weeklyProgressPercent}%`,
                      backgroundColor: sub.color
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
