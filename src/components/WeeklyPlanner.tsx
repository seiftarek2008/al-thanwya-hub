import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Sparkles, 
  Clock, 
  Smile, 
  Check, 
  AlertCircle,
  HelpCircle,
  User,
  Activity,
  Brain,
  Coffee,
  Volume2
} from 'lucide-react';
import { PlannerActivity, Subject } from '../types';

interface WeeklyPlannerProps {
  activities: PlannerActivity[];
  subjects: Subject[];
  onAddActivity: (activity: Omit<PlannerActivity, 'id'>) => void;
  onDeleteActivity: (id: string) => void;
  onOptimizeSchedule: (optimizedList: PlannerActivity[]) => void;
}

const DAYS_ARABIC = [
  'الأحد (Sunday)',
  'الإثنين (Monday)',
  'الثلاثاء (Tuesday)',
  'الأربعاء (Wednesday)',
  'الخميس (Thursday)',
  'الجمعة (Friday)',
  'السبت (Saturday)'
];

const CATEGORIES = [
  { id: 'Study', name: 'مذاكرة مادة أساسية', color: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50' },
  { id: 'Revision', name: 'مراجعة وتكرار متباعد', color: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/40 text-indigo-800 dark:text-indigo-300' },
  { id: 'Homework', name: 'حل واجبات ومسائل', color: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300' },
  { id: 'Assignment', name: 'تطبيق عملي أو بحث', color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-300' },
  { id: 'Exam', name: 'امتحان تجريبي شامي', color: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300' },
  { id: 'Health/Gym', name: 'رياضة وجيم وصحة بدنية', color: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300' },
  { id: 'Family/Personal', name: 'وقت عائلي ومواعيد', color: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/40 text-purple-800 dark:text-purple-300' },
  { id: 'Free Time', name: 'ترفيه وراحة نشطة', color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/40 text-orange-800 dark:text-orange-300' }
];

export default function WeeklyPlanner({ 
  activities, 
  subjects, 
  onAddActivity, 
  onDeleteActivity, 
  onOptimizeSchedule 
}: WeeklyPlannerProps) {
  
  // Form State
  const [title, setTitle] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(0);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [category, setCategory] = useState<PlannerActivity['category']>('Study');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [reminder, setReminder] = useState(true);

  // Filter State
  const [selectedDayFilter, setSelectedDayFilter] = useState<number>(-1); // -1 means show all
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationSuccess, setOptimizationSuccess] = useState(false);

  const subjectMap = useMemo(() => {
    const map: { [id: string]: Subject } = {};
    subjects.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [subjects]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;

    onAddActivity({
      title: title.trim(),
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      priority,
      category,
      subjectId: (category === 'Study' || category === 'Revision' || category === 'Homework' || category === 'Exam') ? subjectId : undefined,
      reminder
    });

    setTitle('');
  };

  // AI-Driven Cognitive Schedule Optimizer
  const handleAIOptimize = () => {
    setIsOptimizing(true);
    setOptimizationSuccess(false);

    setTimeout(() => {
      // Create template scientifically engineered schedule based on student's subjects
      const optimizedList: PlannerActivity[] = [];
      let currentIdCount = 1;

      // Neuroscience rules to build the perfect schedule:
      // 1. Hard subjects studied during high energy mornings (9 AM - 12 PM)
      // 2. Active Recall & Pomodoro intervals built in
      // 3. Spaced repetition after exams
      // 4. Breaks and physical fitness (Gym/Walk) at sunset (5 PM - 6:30 PM)
      // 5. Revision of summaries before bedtime (9 PM - 10:30 PM)

      DAYS_ARABIC.forEach((_, dayIdx) => {
        // Skip Friday for partial rest day / lighter load
        const isFriday = dayIdx === 5;

        if (isFriday) {
          // Friday has light revision + family time
          optimizedList.push({
            id: `opt_${dayIdx}_1`,
            title: 'مراجعة خفيفة لبطاقات الاستذكار الفعالة',
            dayOfWeek: dayIdx,
            startTime: '10:00',
            endTime: '11:00',
            priority: 'medium',
            category: 'Revision',
            reminder: true
          });
          optimizedList.push({
            id: `opt_${dayIdx}_2`,
            title: 'تجمع عائلي وراحة نشطة لتعافي الدماغ',
            dayOfWeek: dayIdx,
            startTime: '13:00',
            endTime: '17:00',
            priority: 'high',
            category: 'Family/Personal',
            reminder: false
          });
          optimizedList.push({
            id: `opt_${dayIdx}_3`,
            title: 'تمارين رياضية خفيفة / جري لتجديد هرمونات التركيز',
            dayOfWeek: dayIdx,
            startTime: '18:00',
            endTime: '19:30',
            priority: 'low',
            category: 'Health/Gym',
            reminder: true
          });
          return;
        }

        // Regular Day (Saturday to Thursday)
        // High cognitive energy morning block
        const subjectMorning = subjects[dayIdx % subjects.length] || subjects[0];
        optimizedList.push({
          id: `opt_${dayIdx}_1`,
          title: `مذاكرة الدرس الجديد: ${subjectMorning?.name.split(' (')[0]}`,
          dayOfWeek: dayIdx,
          startTime: '09:00',
          endTime: '11:00',
          priority: 'high',
          category: 'Study',
          subjectId: subjectMorning?.id,
          reminder: true
        });

        // 11:00 AM mandatory recovery break
        optimizedList.push({
          id: `opt_${dayIdx}_2`,
          title: 'استراحة استعادة الطاقة (تأمل أو شرب ماء)',
          dayOfWeek: dayIdx,
          startTime: '11:00',
          endTime: '11:30',
          priority: 'low',
          category: 'Free Time',
          reminder: false
        });

        // Late afternoon homework/practice questions (Interleaving)
        const subjectNoon = subjects[(dayIdx + 2) % subjects.length] || subjects[0];
        optimizedList.push({
          id: `opt_${dayIdx}_3`,
          title: `حل مسائل وتطبيقات النظام الحديث: ${subjectNoon?.name.split(' (')[0]}`,
          dayOfWeek: dayIdx,
          startTime: '15:00',
          endTime: '16:30',
          priority: 'medium',
          category: 'Homework',
          subjectId: subjectNoon?.id,
          reminder: true
        });

        // Gym or stress relief workout
        if (dayIdx % 2 === 0) {
          optimizedList.push({
            id: `opt_${dayIdx}_4`,
            title: 'تمارين بدنية (تخفيض التوتر ورفع الدوبامين)',
            dayOfWeek: dayIdx,
            startTime: '17:30',
            endTime: '19:00',
            priority: 'medium',
            category: 'Health/Gym',
            reminder: true
          });
        }

        // Night active recall & spaced repetition before sleep (drives consolidation)
        const subjectNight = subjects[(dayIdx + 4) % subjects.length] || subjects[0];
        optimizedList.push({
          id: `opt_${dayIdx}_5`,
          title: `استدعاء نشط ومراجعة متباعدة: ${subjectNight?.name.split(' (')[0]}`,
          dayOfWeek: dayIdx,
          startTime: '20:30',
          endTime: '21:30',
          priority: 'high',
          category: 'Revision',
          subjectId: subjectNight?.id,
          reminder: true
        });
      });

      onOptimizeSchedule(optimizedList);
      setIsOptimizing(false);
      setOptimizationSuccess(true);
      setTimeout(() => setOptimizationSuccess(false), 5000);
    }, 1500);
  };

  // Group and sort activities by time for display
  const activitiesByDay = useMemo(() => {
    const days: { [dayIdx: number]: PlannerActivity[] } = {};
    for (let i = 0; i < 7; i++) {
      days[i] = [];
    }
    
    activities.forEach(act => {
      if (days[act.dayOfWeek] !== undefined) {
        days[act.dayOfWeek].push(act);
      }
    });

    // Sort days chronologically
    Object.keys(days).forEach((dayKey) => {
      const idx = Number(dayKey);
      days[idx].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return days;
  }, [activities]);

  const activeCategoryConfig = (cat: PlannerActivity['category']) => {
    return CATEGORIES.find(c => c.id === cat) || CATEGORIES[0];
  };

  return (
    <div className="space-y-6 text-right" style={{ direction: 'rtl' }}>
      
      {/* Top Banner with AI Optimizer Trigger */}
      <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Calendar className="w-5.5 h-5.5 text-zinc-600 dark:text-zinc-400" />
              <span>الجدول الدراسي والمنظم الأسبوعي الذكي</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              صمم جدولاً مثالياً يدمج حصص المذاكرة، حل الواجبات، مراجعة ليلة الامتحان، مع وقت للراحة والرياضة والعائلة لضمان التوازن العقلي.
            </p>
          </div>

          <button
            onClick={handleAIOptimize}
            disabled={isOptimizing}
            className="py-2.5 px-4 bg-zinc-950 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 text-xs font-semibold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isOptimizing ? (
              <span className="w-4 h-4 rounded-full border-2 border-zinc-400 border-t-zinc-100 animate-spin"></span>
            ) : (
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            )}
            <span>تحسين الجدول بذكاء الأعصاب (AI Schedule Optimizer)</span>
          </button>
        </div>

        {optimizationSuccess && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30 text-xs flex items-center gap-2.5">
            <Check className="w-4.5 h-4.5 text-emerald-600" />
            <span>تم توليد وإعادة تنظيم جدولك الدراسي بنجاح! تم استخدام مبادئ التكرار المتباعد والفترات الصباحية للذاكرة طويلة المدى.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Right Column: Activity Adder */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Plus className="w-4.5 h-4.5 text-zinc-500" />
              <span>إضافة نشاط / مهمة مجدولة</span>
            </h3>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">اسم النشاط أو الدرس:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مراجعة الباب الثاني كيمياء"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">اليوم:</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  >
                    {DAYS_ARABIC.map((day, idx) => (
                      <option key={idx} value={idx}>{day.split(' (')[0]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1">التصنيف:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(category === 'Study' || category === 'Revision' || category === 'Homework' || category === 'Exam') && (
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">المادة المرتبطة:</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">وقت البدء:</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1">وقت الانتهاء:</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">الأولية:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="high">أهمية قصوى (مهم وعاجل)</option>
                    <option value="medium">أهمية متوسطة</option>
                    <option value="low">أهمية منخفضة</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="reminder-chk"
                    checked={reminder}
                    onChange={(e) => setReminder(e.target.checked)}
                    className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 border-zinc-300 dark:border-zinc-700"
                  />
                  <label htmlFor="reminder-chk" className="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">تنبيه بالبريد/تطبيق</label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-950 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة لجدول الأسبوع</span>
              </button>
            </form>
          </div>

          {/* Quick Neuroscience Tip Widget */}
          <div className="p-5 rounded-3xl border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10 space-y-3">
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-zinc-600" />
              <span>علم الأعصاب في تنظيم الوقت (Spacing):</span>
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              تجنب "حشو المعلومات" (Cramming) في ليلة واحدة. عقل الطالب يستوعب الكيمياء والأحياء بشكل مضاعف إذا تم تقسيمها على فترات مذاكرة متقطعة بفاصل يومين على الأقل (Interleaving) مع إدخال فترات راحة قصيرة (NSDR) لإفراز الأسيتيل كولين المسؤول عن الانتباه.
            </p>
          </div>
        </div>

        {/* Left Column: Visual Weekly Grid */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Day selection tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            <button
              onClick={() => setSelectedDayFilter(-1)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDayFilter === -1 
                  ? 'bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 shadow-sm' 
                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              كل الأيام
            </button>
            {DAYS_ARABIC.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDayFilter(idx)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedDayFilter === idx 
                    ? 'bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 shadow-sm' 
                    : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {day.split(' (')[0]}
              </button>
            ))}
          </div>

          {/* Activities list grouped by day */}
          <div className="space-y-4">
            {DAYS_ARABIC.map((dayName, dayIdx) => {
              // Hide day if filtered out
              if (selectedDayFilter !== -1 && selectedDayFilter !== dayIdx) return null;

              const dayActs = activitiesByDay[dayIdx] || [];

              return (
                <div key={dayIdx} className="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-3.5">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-zinc-900 dark:bg-zinc-50 rounded-full"></span>
                      {dayName}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {dayActs.length} أنشطة مجدولة
                    </span>
                  </div>

                  {dayActs.length === 0 ? (
                    <div className="text-center py-6 text-zinc-400 text-xs border border-dashed border-zinc-150 dark:border-zinc-800 rounded-2xl">
                      لا يوجد أنشطة مجدولة اليوم. خطط ليومك أو استخدم المساعد الذكي بالأعلى لتنظيم مجهودك تلقائياً! 🎯
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dayActs.map((act) => {
                        const catConfig = activeCategoryConfig(act.category);
                        const sub = act.subjectId ? subjectMap[act.subjectId] : null;

                        return (
                          <div 
                            key={act.id}
                            className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 group relative transition-all duration-300 hover:shadow-md ${catConfig.color}`}
                          >
                            <button
                              onClick={() => onDeleteActivity(act.id)}
                              className="absolute left-2.5 top-2.5 p-1.5 text-zinc-400 hover:text-red-500 bg-zinc-100 dark:bg-zinc-950 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              title="حذف الموعد"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="space-y-1 pr-1.5 text-right">
                              <span className="text-[9px] uppercase tracking-wider font-bold block opacity-75">
                                {catConfig.name}
                              </span>
                              <strong className="text-xs font-bold block text-zinc-900 dark:text-zinc-50 leading-tight">
                                {act.title}
                              </strong>
                              {sub && (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color }}></span>
                                  <span className="text-[10px] text-zinc-500 font-bold">{sub.name}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50 mt-1 font-mono">
                              <div className="flex items-center gap-1 font-semibold">
                                <Clock className="w-3 h-3" />
                                <span>{act.startTime} - {act.endTime}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                act.priority === 'high' 
                                  ? 'bg-red-100 dark:bg-red-950/20 text-red-700' 
                                  : act.priority === 'medium'
                                  ? 'bg-amber-100 dark:bg-amber-950/20 text-amber-700'
                                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600'
                              }`}>
                                {act.priority === 'high' ? 'عاجل' : act.priority === 'medium' ? 'متوسط' : 'عادي'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
