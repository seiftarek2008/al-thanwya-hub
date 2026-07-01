import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Check, 
  Clock, 
  Edit3, 
  Save, 
  Award, 
  Phone, 
  Bell, 
  Send, 
  CheckCircle, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Share2,
  Trash2,
  ListTodo,
  Zap
} from 'lucide-react';
import { PlannerActivity, Subject, User, GradeRecord } from '../types';

interface TodayTrackerProps {
  user: User;
  activities: PlannerActivity[];
  subjects: Subject[];
  onToggleActivityCompletion: (id: string, updates?: Partial<PlannerActivity>) => void;
  onUpdateProfile: (profile: any) => void;
  onAddGrade?: (grade: Omit<GradeRecord, 'id'>) => void;
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

const CATEGORIES_INFO: { [key: string]: { name: string; color: string } } = {
  Study: { name: 'مذاكرة مادة أساسية', color: 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900' },
  Revision: { name: 'مراجعة وتكرار متباعد', color: 'border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20' },
  Homework: { name: 'حل واجبات ومسائل', color: 'border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20' },
  Assignment: { name: 'تطبيق عملي أو بحث', color: 'border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20' },
  Exam: { name: 'امتحان تجريبي شامي', color: 'border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20' },
  'Health/Gym': { name: 'رياضة وجيم وصحة بدنية', color: 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20' },
  'Family/Personal': { name: 'وقت عائلي ومواعيد', color: 'border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20' },
  'Free Time': { name: 'ترفيه وراحة نشطة', color: 'border-orange-200 dark:border-orange-900/40 bg-orange-50/40 dark:bg-orange-950/20' }
};

export default function TodayTracker({ 
  user, 
  activities = [], 
  subjects = [], 
  onToggleActivityCompletion, 
  onUpdateProfile,
  onAddGrade
}: TodayTrackerProps) {
  
  const [currentDay, setCurrentDay] = useState<number>(new Date().getDay());
  const [phone, setPhone] = useState(user.phone || '');
  const [whatsappReminders, setWhatsappReminders] = useState(!!user.whatsappReminders);
  const [editingPhone, setEditingPhone] = useState(!user.phone);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  
  // Local state for editing information on selected activity
  const [activityNotes, setActivityNotes] = useState('');
  const [examScore, setExamScore] = useState<number | ''>('');
  const [examTotal, setExamTotal] = useState<number | ''>('');
  const [saveStatus, setSaveStatus] = useState<string>('');

  // WhatsApp logs loaded from server
  const [notifLogs, setNotifLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Egypt local date formatting
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('ar-EG', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, []);

  // Filter activities for today
  const todaysActivities = useMemo(() => {
    return activities
      .filter(act => act.dayOfWeek === currentDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [activities, currentDay]);

  const subjectMap = useMemo(() => {
    const map: { [id: string]: Subject } = {};
    subjects.forEach(s => {
      map[s.id] = s;
    });
    return map;
  }, [subjects]);

  // Load WhatsApp reminder logs from the server
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/whatsapp/logs', {
        headers: { 'Authorization': `Bearer ${user.email}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Error fetching whatsapp logs:', e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user.email]);

  // Handle phone and reminder setting updates
  const handleSavePhoneSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onUpdateProfile({
        name: user.name,
        stream: user.stream,
        targetPercentage: user.targetPercentage,
        phone,
        whatsappReminders
      });
      setEditingPhone(false);
      setSaveStatus('success_phone');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Failed to update phone config:', error);
    }
  };

  // Select activity to write details / view logs
  const handleSelectActivity = (act: PlannerActivity) => {
    if (selectedActivityId === act.id) {
      setSelectedActivityId(null);
    } else {
      setSelectedActivityId(act.id);
      setActivityNotes(act.notes || '');
      setExamScore(act.gradeScore !== undefined ? act.gradeScore : '');
      setExamTotal(act.gradeTotal !== undefined ? act.gradeTotal : (act.category === 'Exam' ? 60 : 100));
    }
  };

  // Submit notes, grades, or comments for the current activity
  const handleSaveActivityDetails = (act: PlannerActivity) => {
    const updates: Partial<PlannerActivity> = {
      notes: activityNotes,
    };

    if (examScore !== '') {
      updates.gradeScore = Number(examScore);
      updates.gradeTotal = Number(examTotal || 100);

      // If they input a score, also push it to grades history in AppState so they can view/plot it!
      if (onAddGrade && act.subjectId) {
        onAddGrade({
          subjectId: act.subjectId,
          category: act.category === 'Exam' ? 'Exam' : 'Quiz',
          title: `تقييم ${act.title}`,
          score: Number(examScore),
          totalScore: Number(examTotal || 100),
          date: new Date().toISOString().split('T')[0]
        });
      }
    }

    onToggleActivityCompletion(act.id, updates);
    setSaveStatus('success_act');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Generate instant WhatsApp Click-To-Chat link for safety & direct testing
  const handleTriggerDirectWhatsapp = (act: PlannerActivity) => {
    const targetPhone = phone.replace(/[^0-9]/g, '');
    if (!targetPhone) {
      alert('يرجى حفظ رقم الواتساب الخاص بك أولاً في لوحة التنبيهات الجانبية!');
      return;
    }

    const sub = act.subjectId ? subjectMap[act.subjectId] : null;
    const subName = sub ? sub.name.split(' (')[0] : 'أخرى';
    const message = `🔔 تذكير بطل ثانوية عامة دفعة 2027:
حان الآن موعد المهمة الدراسية: *"${act.title}"*
المادة: *${subName}* (${CATEGORIES_INFO[act.category]?.name || act.category})
الوقت المحدد: من *${act.startTime}* إلى *${act.endTime}* ⏱️
 
ملاحظاتي: ${activityNotes || 'لا توجد ملاحظات.'}
 
دعنا نستغل هذا الوقت بكفاءة عالية ونركز بنسبة 100%! بالتوفيق والنجاح الدائم يا بطل 🚀✨`;

    // Construct direct WhatsApp URL (Supports international dialing - add Egypt country code if not present)
    let formattedPhone = targetPhone;
    if (formattedPhone.startsWith('01')) {
      formattedPhone = '20' + formattedPhone.substring(1); // Add Egypt dial code
    } else if (formattedPhone.startsWith('1')) {
      formattedPhone = '20' + formattedPhone;
    }
    
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    // Simulate sending a test message to server so log list updates
    fetch('/api/whatsapp/test-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.email}`
      },
      body: JSON.stringify({ phone: formattedPhone, message })
    }).then(() => fetchLogs());
  };

  // Send all today's activities in one message via WhatsApp
  const handleSendAllTodayWhatsapp = () => {
    if (todaysActivities.length === 0) {
      alert('لا توجد مهام مجدولة لليوم لإرسالها!');
      return;
    }
    const targetPhone = phone.replace(/[^0-9]/g, '');
    if (!targetPhone) {
      alert('يرجى حفظ رقم الواتساب الخاص بك أولاً في لوحة التنبيهات الجانبية!');
      return;
    }

    const currentDayArabic = DAYS_ARABIC[currentDay]?.split(' (')[0] || 'اليوم';

    let message = `🎯 *جدول مهام اليوم بالكامل (${currentDayArabic})* يا بطل ثانوية عامة دفعة 2027: \n\n`;
    todaysActivities.forEach((act, index) => {
      const sub = act.subjectId ? subjectMap[act.subjectId] : null;
      const subName = sub ? sub.name.split(' (')[0] : 'أخرى';
      const statusEmoji = act.completed ? '✅ مكتمل' : '⏳ مخطط';
      message += `${index + 1}. *[${act.startTime} - ${act.endTime}]* ${act.title} - مادة: *${subName}* (${statusEmoji})\n`;
    });
    message += `\n💪 دعنا نلتزم بجدولنا العصبي اليوم ونستغل وقتنا بكامل طاقتنا! بالتوفيق والنجاح يا بطل! 🚀✨`;

    // Construct phone number
    let formattedPhone = targetPhone;
    if (formattedPhone.startsWith('01')) {
      formattedPhone = '20' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('1')) {
      formattedPhone = '20' + formattedPhone;
    }

    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    // Also call server to log it as a single sent message
    fetch('/api/whatsapp/test-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.email}`
      },
      body: JSON.stringify({ phone: formattedPhone, message })
    }).then(() => fetchLogs());
  };

  // Simulate automatic dispatching for all activities
  const handleSimulateAutoAll = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/whatsapp/simulate-auto-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.email}`
        }
      });
      if (res.ok) {
        alert('تم تشغيل محاكاة الإرسال التلقائي بنجاح! تم توليد تذكيرات ذكية لجميع المواد وإضافتها لسجل الإشعارات أدناه.');
        fetchLogs();
      } else {
        const errData = await res.json();
        alert(`فشلت المحاكاة: ${errData.error || 'خطأ مجهول'}`);
      }
    } catch (e) {
      console.error('Error simulating auto sends:', e);
      alert('حدث خطأ أثناء محاولة محاكاة الإرسال التلقائي.');
    } finally {
      setLoadingLogs(false);
    }
  };

  return (
    <div className="space-y-6 text-right" style={{ direction: 'rtl' }}>
      
      {/* Dynamic Date Header */}
      <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block">منظم المتابعة اليومي</span>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Calendar className="w-5.5 h-5.5 text-zinc-600 dark:text-zinc-400" />
            <span>مهام اليوم: {todayFormatted}</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            يعرض هذا القسم تلقائياً المهام والدروس الثابتة المجدولة لليوم الحالي من خطتك الأسبوعية. يمكنك شطب المهام بعد الانتهاء منها، رصد درجات الاختبارات، وحفظ الملاحظات ومتابعة تذكيرات الواتساب التلقائية.
          </p>
        </div>

        {/* Change day dropdown for simulation */}
        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs text-zinc-500 whitespace-nowrap">محاكاة يوم آخر:</span>
          <select 
            value={currentDay}
            onChange={(e) => setCurrentDay(Number(e.target.value))}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
          >
            {DAYS_ARABIC.map((day, idx) => (
              <option key={idx} value={idx}>{day.split(' (')[0]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Section: Today's Tasks & Timeline */}
        <div className="lg:col-span-8 space-y-4">
          
          {todaysActivities.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-2xl flex items-center justify-center mx-auto text-lg">
                <ListTodo className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">لا يوجد لديك خطة مجدولة لهذا اليوم</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  قم بالانتقال إلى علامة تبويب "المنظم والجدول الأسبوعي" لإعداد مهامك وتوزيعك الدراسي الأسبوعي الثابت، أو قم بتغيير يوم المتابعة من الأعلى للمحاكاة!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Batch WhatsApp Sender Banner */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>أرسل جدول اليوم بالكامل دفعة واحدة 📱</span>
                  </h4>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    وفر وقتك يا بطل! بدلاً من فتح محادثة لكل مادة، أرسل خطة اليوم كاملة لولي الأمر أو لنفسك بنقرة واحدة.
                  </p>
                </div>
                <button
                  onClick={handleSendAllTodayWhatsapp}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl shadow-xs hover:shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap self-stretch sm:self-auto"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال الجدول اليومي كاملاً</span>
                </button>
              </div>

              {todaysActivities.map((act) => {
                const sub = act.subjectId ? subjectMap[act.subjectId] : null;
                const catInfo = CATEGORIES_INFO[act.category] || { name: act.category, color: 'bg-white' };
                const isSelected = selectedActivityId === act.id;

                return (
                  <div 
                    key={act.id}
                    className={`rounded-2xl border transition-all duration-300 ${catInfo.color} ${
                      act.completed 
                        ? 'bg-zinc-50/50 dark:bg-zinc-900/10 border-zinc-200 opacity-75' 
                        : 'shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      
                      {/* Checkbox and Striking Button */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => onToggleActivityCompletion(act.id)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            act.completed
                              ? 'bg-zinc-900 border-zinc-900 text-white'
                              : 'border-zinc-300 hover:border-zinc-600'
                          }`}
                          title={act.completed ? "تراجع عن الإنجاز" : "اشطب كمكتمل"}
                        >
                          {act.completed && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div className="text-right flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-zinc-400 block uppercase tracking-wide">
                            {catInfo.name}
                          </span>
                          <h4 className={`text-xs font-bold leading-snug truncate ${
                            act.completed ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-50'
                          }`}>
                            {act.title}
                          </h4>

                          <div className="flex items-center gap-2.5 mt-1">
                            {sub && (
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color }}></span>
                                <span className="text-[10px] text-zinc-500 font-bold">{sub.name.split(' (')[0]}</span>
                              </span>
                            )}
                            <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{act.startTime} - {act.endTime}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right-Side Badges & Actions */}
                      <div className="flex items-center gap-2">
                        {act.gradeScore !== undefined && (
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />
                            <span>الدرجة: {act.gradeScore} / {act.gradeTotal}</span>
                          </span>
                        )}

                        <button
                          onClick={() => handleSelectActivity(act)}
                          className="p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                          title="تفاصيل إضافية والواتساب"
                        >
                          {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Action Drawer */}
                    {isSelected && (
                      <div className="px-4 pb-4 border-t border-zinc-100 dark:border-zinc-800 pt-3.5 space-y-4 bg-zinc-50/40 dark:bg-zinc-950/20 rounded-b-2xl">
                        
                        {/* Notes and Info Editor */}
                        <div>
                          <label className="block text-xs font-semibold text-zinc-500 mb-1 flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>ملاحظات ومعلومات الدرس (اكتب كل المعلومات لتثبيتها):</span>
                          </label>
                          <textarea
                            value={activityNotes}
                            onChange={(e) => setActivityNotes(e.target.value)}
                            rows={3}
                            placeholder="اكتب الملخص، النوتات أو الكلمات الجديدة، أو أي معلومات عن المهمة لتثبيت الذاكرة..."
                            className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 leading-relaxed"
                          />
                        </div>

                        {/* Exam Grades Section */}
                        {(act.category === 'Exam' || act.category === 'Homework') && (
                          <div className="p-3.5 rounded-xl border border-rose-150 bg-rose-50/10 dark:border-rose-950/30 space-y-3">
                            <h5 className="text-xs font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-rose-500" />
                              <span>رصد وإدخال درجة هذا التقييم:</span>
                            </h5>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] text-zinc-500 mb-1">الدرجة التي حصلت عليها:</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={examScore}
                                  onChange={(e) => setExamScore(e.target.value !== '' ? Number(e.target.value) : '')}
                                  placeholder="مثال: 55"
                                  className="w-full p-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-zinc-500 mb-1">الدرجة النهائية الكلية للمادة:</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={examTotal}
                                  onChange={(e) => setExamTotal(e.target.value !== '' ? Number(e.target.value) : '')}
                                  placeholder="مثال: 60"
                                  className="w-full p-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* WhatsApp Alerts direct trigger */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-zinc-100 dark:border-zinc-800/60 mt-1">
                          <button
                            onClick={() => handleTriggerDirectWhatsapp(act)}
                            className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>تذكير مباشر على رقم الواتساب 💬</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveActivityDetails(act)}
                              className="py-2 px-4 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-950 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>حفظ التفاصيل والملاحظات</span>
                            </button>
                          </div>
                        </div>

                        {saveStatus === 'success_act' && (
                          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>تم حفظ الملاحظات ورصد الدرجة بنجاح!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Section: WhatsApp Integration Settings & Log Feed */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Phone Settings Panel */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <Phone className="w-4.5 h-4.5 text-emerald-600" />
              <span>إعدادات تنبيهات واتساب للطلاب</span>
            </h3>

            {editingPhone ? (
              <form onSubmit={handleSavePhoneSettings} className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">رقم الواتساب الخاص بك:</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="مثال: 01012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100 font-mono"
                    />
                    <Phone className="w-4 h-4 text-zinc-400 absolute right-3 top-2.5" />
                  </div>
                  <span className="text-[9px] text-zinc-400 block mt-1 leading-normal">
                    يرجى إدخال الرقم لكي تتمكن المنصة من إرسال إشعارات التذكير التلقائية بجدولك ودروسك اليومية.
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="wa-remind-chk"
                    checked={whatsappReminders}
                    onChange={(e) => setWhatsappReminders(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300 dark:border-zinc-700"
                  />
                  <label htmlFor="wa-remind-chk" className="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer font-semibold">
                    تفعيل تذكير الواتساب التلقائي 💬
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  حفظ وتفعيل التنبيهات
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800">
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-400 block">الرقم المفعل حالياً:</span>
                    <strong className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">{phone}</strong>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    whatsappReminders ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                  }`}>
                    {whatsappReminders ? 'تنبيه تلقائي نشط' : 'تنبيه تلقائي متوقف'}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setEditingPhone(true)}
                    className="w-full py-1.5 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs rounded-xl hover:bg-zinc-50 cursor-pointer font-bold"
                  >
                    تعديل الرقم 📱
                  </button>
                  <button
                    onClick={handleSimulateAutoAll}
                    disabled={loadingLogs}
                    className="w-full py-2 bg-zinc-950 dark:bg-zinc-100 text-zinc-55 dark:text-zinc-950 text-[11px] font-bold rounded-xl hover:bg-zinc-850 dark:hover:bg-zinc-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    <span>تشغيل محاكاة الإرسال التلقائي للكل 🤖</span>
                  </button>
                </div>
              </div>
            )}

            {saveStatus === 'success_phone' && (
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>تم حفظ وتفعيل رقم الواتساب بالنجاح!</span>
              </div>
            )}
          </div>

          {/* Simulated WhatsApp Notification Event Log */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-amber-500 animate-swing" />
                <span>سجل إشعارات التذكير التلقائية</span>
              </h3>
              <button 
                onClick={fetchLogs} 
                disabled={loadingLogs}
                className="text-[10px] text-zinc-400 hover:text-zinc-900"
              >
                تحديث السجل
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto scrollbar-thin">
              {loadingLogs ? (
                <div className="text-center py-4 text-xs text-zinc-400">جاري تحميل السجل...</div>
              ) : notifLogs.length === 0 ? (
                <div className="text-center py-6 text-[11px] text-zinc-400 leading-normal border border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">
                  سجل التذكيرات فارغ حالياً. سيعمل روبوت التنبيهات في الخلفية لإرسال رسائل تذكير تلقائية دقيقة لكل مادة وجلسة مذاكرة عند اقتراب موعدها! 🔔💡
                </div>
              ) : (
                notifLogs.map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-right space-y-1">
                    <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                      <span>{new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-emerald-600 font-bold">تم الإرسال ✓</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 dark:text-zinc-300 leading-normal">
                      {log.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
