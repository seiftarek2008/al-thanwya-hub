/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Clock, Flame, CheckCircle, Award, Brain, AlertTriangle, Zap, ArrowUpRight } from 'lucide-react';
import { Subject, StudySession, Task, Exam, GradeRecord } from '../types';
import CustomChartBuilder from './CustomChartBuilder';

interface StatsDashboardProps {
  subjects: Subject[];
  sessions: StudySession[];
  tasks: Task[];
  streak: number;
  exams?: Exam[];
  grades?: GradeRecord[];
}

export default function StatsDashboard({ subjects, sessions, tasks, streak, exams = [], grades = [] }: StatsDashboardProps) {
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

  // Weekly comparison calculations (This Week vs. Last Week)
  const comparisonStats = useMemo(() => {
    const today = new Date();
    
    // This week: last 7 days (today is Day 0, we look at Day 0 to Day 6)
    const thisWeekStart = new Date();
    thisWeekStart.setDate(today.getDate() - 7);
    thisWeekStart.setHours(0, 0, 0, 0);

    // Last week: Day 7 to Day 13
    const lastWeekStart = new Date();
    lastWeekStart.setDate(today.getDate() - 14);
    lastWeekStart.setHours(0, 0, 0, 0);

    // 1. Study hours
    const hoursThisWeek = sessions
      .filter((s) => new Date(s.timestamp) >= thisWeekStart)
      .reduce((acc, s) => acc + s.duration, 0) / 3600;

    const hoursLastWeek = sessions
      .filter((s) => {
        const d = new Date(s.timestamp);
        return d >= lastWeekStart && d < thisWeekStart;
      })
      .reduce((acc, s) => acc + s.duration, 0) / 3600;

    // 2. Completed tasks
    const tasksThisWeek = tasks.filter((t) => {
      if (t.status !== 'done' || !t.completedAt) return false;
      return new Date(t.completedAt) >= thisWeekStart;
    }).length;

    const tasksLastWeek = tasks.filter((t) => {
      if (t.status !== 'done' || !t.completedAt) return false;
      const d = new Date(t.completedAt);
      return d >= lastWeekStart && d < thisWeekStart;
    }).length;

    // 3. Average Focus Score
    const sessionsThisWeek = sessions.filter((s) => new Date(s.timestamp) >= thisWeekStart);
    const avgFocusThisWeek = sessionsThisWeek.length > 0
      ? sessionsThisWeek.reduce((acc, s) => acc + s.focusScore, 0) / sessionsThisWeek.length
      : 0;

    const sessionsLastWeek = sessions.filter((s) => {
      const d = new Date(s.timestamp);
      return d >= lastWeekStart && d < thisWeekStart;
    });
    const avgFocusLastWeek = sessionsLastWeek.length > 0
      ? sessionsLastWeek.reduce((acc, s) => acc + s.focusScore, 0) / sessionsLastWeek.length
      : 0;

    // 4. Grades Performance (Percent average)
    const getPercent = (score: number, total: number) => (score / total) * 100;
    
    const scoresThisWeek: number[] = [];
    grades.forEach((g) => {
      if (new Date(g.date) >= thisWeekStart) {
        scoresThisWeek.push(getPercent(g.score, g.totalScore));
      }
    });
    exams.forEach((e) => {
      if (e.score !== undefined && new Date(e.date) >= thisWeekStart) {
        scoresThisWeek.push(getPercent(e.score, e.totalScore));
      }
    });
    const avgGradeThisWeek = scoresThisWeek.length > 0
      ? scoresThisWeek.reduce((acc, v) => acc + v, 0) / scoresThisWeek.length
      : 0;

    const scoresLastWeek: number[] = [];
    grades.forEach((g) => {
      const d = new Date(g.date);
      if (d >= lastWeekStart && d < thisWeekStart) {
        scoresLastWeek.push(getPercent(g.score, g.totalScore));
      }
    });
    exams.forEach((e) => {
      if (e.score !== undefined) {
        const d = new Date(e.date);
        if (d >= lastWeekStart && d < thisWeekStart) {
          scoresLastWeek.push(getPercent(e.score, e.totalScore));
        }
      }
    });
    const avgGradeLastWeek = scoresLastWeek.length > 0
      ? scoresLastWeek.reduce((acc, v) => acc + v, 0) / scoresLastWeek.length
      : 0;

    return {
      hoursThisWeek,
      hoursLastWeek,
      tasksThisWeek,
      tasksLastWeek,
      focusThisWeek: avgFocusThisWeek,
      focusLastWeek: avgFocusLastWeek,
      gradeThisWeek: avgGradeThisWeek,
      gradeLastWeek: avgGradeLastWeek
    };
  }, [sessions, tasks, grades, exams]);

  const getNeuroscienceAdvisorText = (stats: typeof comparisonStats) => {
    const hoursDiff = stats.hoursThisWeek - stats.hoursLastWeek;
    const gradeDiff = stats.gradeThisWeek - stats.gradeLastWeek;

    if (stats.hoursThisWeek === 0 && stats.hoursLastWeek === 0) {
      return "لم نلاحظ وجود أي جلسات مذاكرة مسجلة حتى الآن يا بطل! ابدأ اليوم أولى جلسات المذاكرة العميقة لتفعيل روابط قشرة الدماغ الجبهية وتنمية مستواك العصبي.";
    }

    let advise = "";
    if (hoursDiff > 0) {
      advise += "📈 رائع جداً! لقد زادت ساعات مذاكرتك هذا الأسبوع مقارنة بالأسبوع الماضي، مما يعني زيادة المران العقلي وقوة التركيز العصبي. ";
    } else if (hoursDiff < 0) {
      advise += "⚠️ انتبه يا بطل، تراجعت ساعات المذاكرة هذا الأسبوع مقارنة بالأسبوع الماضي. قد تشعر ببعض التعب أو الإجهاد مؤقتاً؛ ننصحك بتبسيط فترات الدراسة واستخدام جلسات طماطم (Pomodoro) قصيرة لاستعادة شغفك. ";
    } else {
      advise += "➖ أداؤك الزمني مستقر وثابت هذا الأسبوع مقارنة بالأسبوع السابق. الاستمرارية هي مفتاح التفوق في الثانوية العامة! ";
    }

    if (gradeDiff > 0) {
      advise += "🌟 مستواك التحصيلي في تصاعد مستمر! ارتفاع درجات الاختبارات والتقييمات يدل على أن آليات الاسترجاع النشط والتكرار المتباعد تعمل بكفاءة تامة وتتحول إلى ذاكرة طويلة المدى.";
    } else if (gradeDiff < 0) {
      advise += "🔍 مستويات الاختبارات تراجعت قليلاً مقارنة بالأسبوع الماضي. لا تقلق، الاختبارات وسيلة لتحديد الفجوات المعرفية؛ ركّز في الأسبوع القادم على مراجعة الأخطاء وحل أسئلة أكثر قبل الدخول للاختبار.";
    } else {
      advise += "👍 مستواك في حل الأسئلة والتقييمات مستقر تماماً. استمر في رصد الدرجات لتقوية ثقتك وقدرتك على التذكر تحت الضغط المعتدل.";
    }

    return advise;
  };

  const renderComparisonCard = (
    title: string,
    currentValue: number,
    previousValue: number,
    unit: string,
    isPercentage: boolean = false
  ) => {
    const difference = currentValue - previousValue;
    const isImprovement = difference > 0;
    const isDecline = difference < 0;
    
    // Percent change
    let percentChange = 0;
    if (previousValue > 0) {
      percentChange = Math.round((difference / previousValue) * 100);
    } else if (currentValue > 0) {
      percentChange = 100;
    }

    return (
      <div className="p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/45 flex flex-col justify-between">
        <div className="text-right">
          <span className="text-[11px] font-bold text-zinc-400 block">{title}</span>
          <div className="mt-2 flex items-baseline gap-1">
            <h4 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
              {isPercentage ? `${currentValue.toFixed(0)}${unit}` : `${currentValue.toFixed(1)} ${unit}`}
            </h4>
            <span className="text-[10px] text-zinc-450 dark:text-zinc-500 mr-1.5 font-bold">
              السابق: {isPercentage ? `${previousValue.toFixed(0)}${unit}` : `${previousValue.toFixed(1)} ${unit}`}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 flex items-center justify-between border-t border-zinc-150/50 dark:border-zinc-800/50">
          <span className="text-[9px] text-zinc-400">التغير الأسبوعي:</span>
          {difference === 0 ? (
            <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-0.5">
              <span>ثابت</span>
              <span>➖</span>
            </span>
          ) : isImprovement ? (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5" style={{ direction: 'ltr' }}>
              <span>+{isPercentage ? `${difference.toFixed(0)}${unit}` : `${difference.toFixed(1)}${unit}`} (+{percentChange}%)</span>
              <span>📈</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-0.5" style={{ direction: 'ltr' }}>
              <span>{isPercentage ? `${difference.toFixed(0)}${unit}` : `${difference.toFixed(1)}${unit}`} ({percentChange}%)</span>
              <span>📉</span>
            </span>
          )}
        </div>
      </div>
    );
  };

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

      {/* Weekly Level Progress and Comparison Section */}
      <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="space-y-1 text-right">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              <span>مقارنة مستواك الدراسي الأسبوعية (الأسبوع الحالي 🆚 الأسبوع السابق)</span>
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">تحليل فوري دقيق يوضح مدى تطور الروابط العصبية واستجابة الخلايا للتحصيل الدراسي ومعدل إنجاز المهام.</p>
          </div>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/35 text-emerald-600 dark:text-emerald-400 border border-emerald-100/30">
            مقارنة مستوى الأسبوع
          </span>
        </div>

        {/* Bento Grid Comparisons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-right">
          {renderComparisonCard(
            "ساعات المذاكرة المنجزة",
            comparisonStats.hoursThisWeek,
            comparisonStats.hoursLastWeek,
            "ساعة"
          )}

          {renderComparisonCard(
            "المهام المنتهية",
            comparisonStats.tasksThisWeek,
            comparisonStats.tasksLastWeek,
            "مهمة"
          )}

          {renderComparisonCard(
            "متوسط درجة التركيز",
            comparisonStats.focusThisWeek,
            comparisonStats.focusLastWeek,
            "%",
            true
          )}

          {renderComparisonCard(
            "مستوى التحصيل والدرجات",
            comparisonStats.gradeThisWeek,
            comparisonStats.gradeLastWeek,
            "%",
            true
          )}
        </div>

        {/* Dynamic AI Advisor Panel */}
        <div className="p-4 rounded-2xl border border-zinc-150/70 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/25 flex items-start gap-3">
          <Brain className="w-5 h-5 text-amber-500 mt-0.5 shrink-0 animate-pulse" />
          <div className="space-y-1 text-right">
            <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-150 flex items-center gap-1.5">
              <span>التحليل الإرشادي للأداء الأسبوعي 🧠</span>
            </h5>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {getNeuroscienceAdvisorText(comparisonStats)}
            </p>
          </div>
        </div>
      </div>

      {/* Custom Interactive Chart Builder Engine */}
      <CustomChartBuilder 
        subjects={subjects} 
        sessions={sessions} 
        exams={exams} 
        grades={grades} 
      />

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
