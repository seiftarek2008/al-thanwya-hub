import React, { useState, useMemo, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Calendar, 
  Award, 
  Clock, 
  Smile, 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  Coffee, 
  PhoneOff, 
  Activity, 
  Plus, 
  Trash2, 
  Moon, 
  Sliders, 
  BookOpen,
  ChevronRight,
  Battery
} from 'lucide-react';
import { Subject, SleepLog, ScreenTimeLog, DailyCheckin, GradeRecord, PlannerActivity } from '../types';

interface NeurosciencePanelProps {
  stream: 'math' | 'science' | 'literature';
  consistencyScore: number;
  subjects: Subject[];
  sleepLogs: SleepLog[];
  screenTimeLogs: ScreenTimeLog[];
  dailyCheckins: DailyCheckin[];
  grades: GradeRecord[];
  plannerActivities: PlannerActivity[];
  onAddSleepLog: (log: Omit<SleepLog, 'id'>) => void;
  onAddScreenTimeLog: (log: Omit<ScreenTimeLog, 'id'>) => void;
  onAddDailyCheckin: (checkin: Omit<DailyCheckin, 'id'>) => void;
  onAddGrade: (grade: Omit<GradeRecord, 'id'>) => void;
  onDeleteGrade: (id: string) => void;
}

export default function NeurosciencePanel({
  stream,
  consistencyScore,
  subjects,
  sleepLogs,
  screenTimeLogs,
  dailyCheckins,
  grades,
  plannerActivities,
  onAddSleepLog,
  onAddScreenTimeLog,
  onAddDailyCheckin,
  onAddGrade,
  onDeleteGrade
}: NeurosciencePanelProps) {
  // Tabs State
  const [activeSubTab, setActiveSubTab] = useState<'spaced' | 'checkin' | 'burnout' | 'grades'>('spaced');

  // Daily Checkin Form State
  const [focusLevel, setFocusLevel] = useState(4);
  const [motivation, setMotivation] = useState(4);
  const [stress, setStress] = useState(3);
  const [fatigue, setFatigue] = useState(2);
  const [checkinMessage, setCheckinMessage] = useState('');

  // Sleep Form State
  const [bedtime, setBedtime] = useState('23:00');
  const [waketime, setWaketime] = useState('06:30');
  const [sleepQuality, setSleepQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [sleepMessage, setSleepMessage] = useState('');

  // Screen Time Form State
  const [screenMinutes, setScreenMinutes] = useState('');
  const [screenMessage, setScreenMessage] = useState('');

  // Grade Form State
  const [gradeSubjectId, setGradeSubjectId] = useState(subjects[0]?.id || '');
  const [gradeCategory, setGradeCategory] = useState<GradeRecord['category']>('Quiz');
  const [gradeTitle, setGradeTitle] = useState('');
  const [gradeScore, setGradeScore] = useState('');
  const [gradeTotal, setGradeTotal] = useState('20');
  const [gradeWeak, setGradeWeak] = useState('');
  const [gradeStrong, setGradeStrong] = useState('');
  const [gradeBranch, setGradeBranch] = useState('');

  // Get active subject branches dynamically
  const activeSubjectBranches = useMemo(() => {
    const sub = subjects.find(s => s.id === gradeSubjectId);
    return sub?.branches || [];
  }, [gradeSubjectId, subjects]);

  // Set default branch when subject changes
  useEffect(() => {
    if (activeSubjectBranches.length > 0) {
      setGradeBranch(activeSubjectBranches[0]);
    } else {
      setGradeBranch('');
    }
  }, [activeSubjectBranches]);

  // Spaced Repetition static list (as simulated fallback tracker)
  const [spacedRepetitionList, setSpacedRepetitionList] = useState([
    { id: '1', subject: 'الكيمياء', topic: 'المركبات الهيدروكربونية والألكانات', lastReviewed: 'منذ يوم واحد', nextReview: 'اليوم (مراجعة متباعدة ١)', checked: false },
    { id: '2', subject: 'الفيزياء', topic: 'قانون أوم للدائرة المغلقة', lastReviewed: 'منذ ٣ أيام', nextReview: 'غداً (مراجعة متباعدة ٢)', checked: false },
    { id: '3', subject: 'اللغة العربية', topic: 'المدرسة الكلاسيكية الجديدة في الأدب', lastReviewed: 'منذ ٧ أيام', nextReview: 'بعد يومين (مراجعة متباعدة ٣)', checked: false },
  ]);

  const handleToggleSpaced = (id: string) => {
    setSpacedRepetitionList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  // Grade lists & helpers
  const subjectMap = useMemo(() => {
    const map: { [id: string]: Subject } = {};
    subjects.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [subjects]);

  // Overall grades analytics
  const gradesStats = useMemo(() => {
    if (grades.length === 0) return { overallAvg: 0, subjectAverages: [] };
    
    // Overall average percentage
    const totalPerc = grades.reduce((acc, g) => acc + (g.score / g.totalScore) * 100, 0);
    const overallAvg = Math.round(totalPerc / grades.length);

    // Group by subject
    const subjectGradesMap: { [id: string]: { scores: number[]; total: number[] } } = {};
    grades.forEach(g => {
      if (!subjectGradesMap[g.subjectId]) {
        subjectGradesMap[g.subjectId] = { scores: [], total: [] };
      }
      subjectGradesMap[g.subjectId].scores.push(g.score);
      subjectGradesMap[g.subjectId].total.push(g.totalScore);
    });

    const subjectAverages = Object.keys(subjectGradesMap).map(subId => {
      const rec = subjectGradesMap[subId];
      const sumScores = rec.scores.reduce((a, b) => a + b, 0);
      const sumTotals = rec.total.reduce((a, b) => a + b, 0);
      const avg = sumTotals > 0 ? Math.round((sumScores / sumTotals) * 100) : 0;
      return {
        subjectId: subId,
        subjectName: subjectMap[subId]?.name || 'مادة أخرى',
        color: subjectMap[subId]?.color || '#94a3b8',
        avg,
        count: rec.scores.length
      };
    });

    return { overallAvg, subjectAverages };
  }, [grades, subjects, subjectMap]);

  // Advanced Branch Diagnosis Engine
  const branchDiagnosis = useMemo(() => {
    // Group grades by subjectId and branch
    const branchScores: { [subId: string]: { [branchName: string]: { scores: number[]; totals: number[] } } } = {};

    grades.forEach((g) => {
      if (!g.branch) return;
      if (!branchScores[g.subjectId]) {
        branchScores[g.subjectId] = {};
      }
      if (!branchScores[g.subjectId][g.branch]) {
        branchScores[g.subjectId][g.branch] = { scores: [], totals: [] };
      }
      branchScores[g.subjectId][g.branch].scores.push(g.score);
      branchScores[g.subjectId][g.branch].totals.push(g.totalScore);
    });

    const weaknesses: { subjectName: string; branch: string; avg: number; subColor: string; recommendation: string }[] = [];
    const strengths: { subjectName: string; branch: string; avg: number; subColor: string }[] = [];

    Object.keys(branchScores).forEach((subId) => {
      const sub = subjectMap[subId];
      if (!sub) return;
      const branchesData = branchScores[subId];

      Object.keys(branchesData).forEach((bName) => {
        const { scores, totals } = branchesData[bName];
        const sumScore = scores.reduce((a, b) => a + b, 0);
        const sumTotal = totals.reduce((a, b) => a + b, 0);
        const avg = sumTotal > 0 ? Math.round((sumScore / sumTotal) * 100) : 0;

        if (avg < 80) {
          // Weakness identified
          let recommendation = '';
          if (bName.includes('نحو')) {
            recommendation = 'النحو التراكمي يعتمد على فهم القواعد الكلية. قم بحل ١٠ جمل إعرابية يومياً كاستدعاء نشط (Active Recall).';
          } else if (bName.includes('عضوية') || bName.includes('Chemistry')) {
            recommendation = 'الكيمياء العضوية تحتاج لخرائط ذهنية تفاعلية للروابط والتفاعلات. ارسم مخطط تفاعلات الألكينات باليد دون النظر للكتاب.';
          } else if (bName.includes('كهرب') || bName.includes('الفيزياء')) {
            recommendation = 'قوانين كيرشوف وتوصيل المقاومات يُتقن بـ "تعليم الأقران" (Feynman Technique). اشرح طريقة حل المسألة لنفسك بصوت عالٍ.';
          } else if (bName.includes('أحياء') || bName.includes('Biology') || bName.includes('دعامة') || bName.includes('تكاثر')) {
            recommendation = 'الأحياء تحتاج فهم عميق للمصطلحات والمقارنات. استخدم بطاقات التكرار المتباعد (Spaced Repetition) لتثبيت أسماء الهرمونات ووظائفها.';
          } else if (bName.includes('جبر') || bName.includes('تفاضل') || bName.includes('الرياضيات')) {
            recommendation = 'الرياضيات مهارة عضلية للعقل. لا تكتفِ بقراءة الحلول؛ قم بإعادة حل المسائل الصعبة فوراً بنفسك.';
          } else if (sub.name.includes('عربي') || sub.name.includes('Arabic')) {
            recommendation = 'عزز مهاراتك في هذا الفرع بمراجعة أسئلة الامتحانات الاسترشادية الوزارية وحل أسئلة الفهم القرائي المتكاملة.';
          } else if (sub.name.includes('إنجليزية') || sub.name.includes('English')) {
            recommendation = 'تدرب على كتابة الجمل السليمة وتوسيع حصيلة الكلمات عبر وضع الكلمات الصعبة في سياقات درامية مألوفة.';
          } else {
            recommendation = `فرع ${bName} يحتاج لتطبيق فوري. قم بمذاكرة الجزء النظري لـ ٢٠ دقيقة ثم حل تدريبات مكثفة دون استخدام الملاحظات.`;
          }

          weaknesses.push({
            subjectName: sub.name.split(' (')[0],
            branch: bName,
            avg,
            subColor: sub.color,
            recommendation
          });
        } else {
          strengths.push({
            subjectName: sub.name.split(' (')[0],
            branch: bName,
            avg,
            subColor: sub.color
          });
        }
      });
    });

    return { weaknesses, strengths };
  }, [grades, subjectMap]);

  // Submit Daily Checkin
  const handleCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddDailyCheckin({
      date: new Date().toISOString().split('T')[0],
      focusLevel,
      motivation,
      stress,
      fatigue
    });
    setCheckinMessage('تم تسجيل حالتك الذهنية والتركيز بنجاح! سيتم تعديل التوصيات فوراً.');
    setTimeout(() => setCheckinMessage(''), 4000);
  };

  // Submit Sleep Log
  const handleSleepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse bedtime & waketime to calculate duration
    const bedParts = bedtime.split(':').map(Number);
    const wakeParts = waketime.split(':').map(Number);
    
    let hours = wakeParts[0] - bedParts[0];
    let mins = wakeParts[1] - bedParts[1];
    
    if (hours < 0 || (hours === 0 && mins < 0)) {
      hours += 24; // spans past midnight
    }
    
    const durationHours = Number((hours + mins / 60).toFixed(1));

    onAddSleepLog({
      date: new Date().toISOString().split('T')[0],
      bedtime,
      waketime,
      durationHours,
      quality: sleepQuality
    });

    setSleepMessage(`تم تسجيل نومك اليوم بنجاح (${durationHours} ساعة). جودة النوم: ${sleepQuality === 'excellent' ? 'ممتازة' : sleepQuality === 'good' ? 'جيدة' : sleepQuality === 'fair' ? 'متوسطة' : 'سيئة'}.`);
    setTimeout(() => setSleepMessage(''), 4000);
  };

  // Submit Screen Time Log
  const handleScreenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = Number(screenMinutes);
    if (isNaN(mins) || mins < 0) return;

    onAddScreenTimeLog({
      date: new Date().toISOString().split('T')[0],
      minutes: mins
    });

    setScreenMinutes('');
    setScreenMessage(`تم تسجيل وقت الشاشة بنجاح (${(mins / 60).toFixed(1)} ساعة).`);
    setTimeout(() => setScreenMessage(''), 4000);
  };

  // Submit Grade Log
  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const score = Number(gradeScore);
    const total = Number(gradeTotal);
    if (!gradeTitle.trim() || isNaN(score) || isNaN(total) || total <= 0) return;

    onAddGrade({
      subjectId: gradeSubjectId,
      category: gradeCategory,
      title: gradeTitle.trim(),
      score,
      totalScore: total,
      date: new Date().toISOString().split('T')[0],
      weakChapters: gradeWeak.trim() ? gradeWeak.split(',').map(s => s.trim()) : [],
      strongChapters: gradeStrong.trim() ? gradeStrong.split(',').map(s => s.trim()) : [],
      branch: gradeBranch || undefined
    });

    setGradeTitle('');
    setGradeScore('');
    setGradeWeak('');
    setGradeStrong('');
  };

  // ----------------------------------------------------
  // BURNOUT RISK ESTIMATION ENGINE (Multi-indicator feedback)
  // ----------------------------------------------------
  const burnoutAnalysis = useMemo(() => {
    let score = 20; // base risk score out of 100

    const recentCheckin = dailyCheckins[dailyCheckins.length - 1];
    const recentSleep = sleepLogs[sleepLogs.length - 1];
    const recentScreen = screenTimeLogs[screenTimeLogs.length - 1];

    // 1. Stress & Fatigue Indicators
    if (recentCheckin) {
      score += recentCheckin.stress * 8;      // Up to +40%
      score += recentCheckin.fatigue * 6;     // Up to +30%
      score -= recentCheckin.motivation * 4;  // High motivation reduces burnout feeling (up to -20%)
    }

    // 2. Sleep Quality & Duration Indicators
    if (recentSleep) {
      if (recentSleep.durationHours < 6) score += 15;
      else if (recentSleep.durationHours > 8) score -= 10;
      
      if (recentSleep.quality === 'poor') score += 10;
      else if (recentSleep.quality === 'excellent') score -= 10;
    }

    // 3. Excessive Screen Exposure Indicators
    if (recentScreen) {
      if (recentScreen.minutes > 300) score += 15; // > 5 hours
      else if (recentScreen.minutes > 180) score += 8;  // > 3 hours
    }

    // Ensure range bounds [0, 100]
    score = Math.min(Math.max(score, 10), 100);

    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    let explanation = '';
    let recommendations: string[] = [];

    if (score >= 65) {
      riskLevel = 'high';
      explanation = 'خطر الاحتراق الأكاديمي لديك مرتفع جداً حالياً! تشير بيانات نومك القليل ومستويات التعب الذهني والتوتر العالية إلى اقتراب عقل المذاكرة من نقطة الانهيار، مما سيؤدي لضعف حاد في استبقاء الذاكرة وزيادة التشتت.';
      recommendations = [
        'خفض حدة المذاكرة فوراً بمعدل 50% لليومين القادمين.',
        'افصل جميع الشاشات والهواتف بدءاً من الساعة 9:00 مساءً لدعم افراز الميلاتونين وتصفية الذهن.',
        'قم بجلسة استرخاء عميق (NSDR) لمدة 20 دقيقة عصراً لدعم تعافي قرن آمون (Hippocampus).',
        'ركز فقط على مادة واحدة مفضلة بدلاً من التنقل العشوائي لمنع ارهاق التبديل الإدراكي.'
      ];
    } else if (score >= 35) {
      riskLevel = 'moderate';
      explanation = 'مستوى التعب والضغط الأكاديمي متوسط. عتبة تركيزك مستقرة ولكن عضلات الانتباه لديك بدأت تشعر بالإرهاق. هناك توازن مقبول ولكن يرجى ضبط ساعات النوم لتفادي تراجع معدلات الإنتاجية.';
      recommendations = [
        'نم لمدة لا تقل عن 7.5 ساعات الليلة لتوحيد خلايا الذاكرة العصبية المعقدة.',
        'التزم بـ "تقنية الفترات المتباعدة" ولا تقم بإنشاء جلسات ممتدة تزيد عن 90 دقيقة عمل عميق.',
        'اشرب ما لا يقل عن 2.5 لتر من الماء؛ خلايا الدماغ الرطبة تنقل الإشارات الكهربائية بكفاءة تفوق بـ 20% خلايا الجفاف.'
      ];
    } else {
      riskLevel = 'low';
      explanation = 'مؤشر طاقتك الإدراكية ممتاز وفي أعلى معدلات الاستعداد الدراسي! يظهر توازن رائع بين ساعات النوم والراحة ومستويات التوتر المنخفضة، وهي حالة مثالية لاستقبال المفاهيم المعقدة وحلها.';
      recommendations = [
        'استمر على هذا التوازن واستغل الصباح الباكر لحل مسائل النظم الجديدة المعقدة.',
        'فعل مبدأ الاستدعاء الذاتي وكافئ نفسك بدوبامين صحي بعد كل جلسة ناجحة (أكلة مفضلة أو راحة نشطة).'
      ];
    }

    return { score, riskLevel, explanation, recommendations };
  }, [dailyCheckins, sleepLogs, screenTimeLogs]);

  return (
    <div className="space-y-6 text-right animate-fade-in" style={{ direction: 'rtl' }}>
      
      {/* Tab Selectors */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('spaced')}
          className={`pb-3 pt-1 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'spaced'
              ? 'border-zinc-950 dark:border-zinc-50 text-zinc-950 dark:text-zinc-50'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>علم الأعصاب والذاكرة المتباعدة</span>
        </button>

        <button
          onClick={() => setActiveSubTab('checkin')}
          className={`pb-3 pt-1 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'checkin'
              ? 'border-zinc-950 dark:border-zinc-50 text-zinc-950 dark:text-zinc-50'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>مؤشراتي الحيوية (نوم / شاشة / توتر)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('burnout')}
          className={`pb-3 pt-1 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'burnout'
              ? 'border-zinc-950 dark:border-zinc-50 text-zinc-950 dark:text-zinc-50'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>مقياس الإجهاد والاحتراق الأكاديمي</span>
        </button>

        <button
          onClick={() => setActiveSubTab('grades')}
          className={`pb-3 pt-1 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'grades'
              ? 'border-zinc-950 dark:border-zinc-50 text-zinc-950 dark:text-zinc-50'
              : 'border-transparent text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>دفتر التقييمات والدرجات</span>
        </button>
      </div>

      {/* 1. Spaced Repetition Tab */}
      {activeSubTab === 'spaced' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>تقنيات الذاكرة الصلبة وتفعيل الاستدعاء الفعال</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
              إن حفظ مناهج الثانوية العامة الهائلة يتطلب تحفيز هرموني مستمر لإشارات الخلايا العصبية عبر تقنية <strong>Active Recall</strong> (إغلاق المذكرة وتسميع المفهوم غيباً) وتقنية <strong>Spaced Repetition</strong> (المراجعة على فترات متباعدة تتغلب على منحنى النسيان الطبيعي).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 text-right">
                <span className="w-6 h-6 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs mb-3">١</span>
                <strong className="text-xs text-zinc-800 dark:text-zinc-200 block mb-1">الاستدعاء النشط (Active Recall)</strong>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">تجنب وهم المعرفة الحاصل من قراءة ملخصات جاهزة. اختبر نفسك باستمرار، حل أسئلة قبل البدء بالقراءة، أو استعمل الفلش كارد لتسميع المعلومات.</p>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 text-right">
                <span className="w-6 h-6 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-xs mb-3">٢</span>
                <strong className="text-xs text-zinc-800 dark:text-zinc-200 block mb-1">التكرار المتباعد (Spaced Repetition)</strong>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">راجع الدرس بعد يوم واحد من مذاكرته، ثم بعد 3 أيام، ثم بعد 7 أيام، ثم بعد شهر. هذا يضمن نقل المعلومات من الذاكرة اللحظية إلى الذاكرة الصلبة الدائمة.</p>
              </div>

              <div className="p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 text-right">
                <span className="w-6 h-6 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs mb-3">٣</span>
                <strong className="text-xs text-zinc-800 dark:text-zinc-200 block mb-1">تداخل المذاكرة (Interleaving)</strong>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">تجنب دراسة مادة واحدة طوال اليوم! عقلك يتعب سريعاً. اخلط بين مادة علمية جافة ومادة أدبية أو حل مسائل النحو لتنشيط فصوص المخ المختلفة بالتناوب.</p>
              </div>
            </div>
          </div>

          {/* Active Recall checklist */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">المهام المجدولة للتكرار المتباعد هذا الأسبوع</h4>
                <p className="text-[10px] text-zinc-500">مبنية تلقائياً على سجل مذاكرتك الفائت لمقاومة معدل النسيان.</p>
              </div>
              <Zap className="w-4.5 h-4.5 text-zinc-500" />
            </div>

            <div className="space-y-3">
              {spacedRepetitionList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleSpaced(item.id)}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    item.checked
                      ? 'bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-950 opacity-60'
                      : 'bg-zinc-50/50 dark:bg-zinc-950/30 border-zinc-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      item.checked ? 'bg-zinc-900 dark:bg-zinc-100 border-transparent text-white dark:text-zinc-950' : 'border-zinc-300 dark:border-zinc-700'
                    }`}>
                      {item.checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h5 className={`text-xs font-bold ${item.checked ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                        {item.topic}
                      </h5>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                        <span className="bg-zinc-150 dark:bg-zinc-850 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400 font-bold">{item.subject}</span>
                        <span>•</span>
                        <span>آخر تكرار: {item.lastReviewed}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                    item.checked ? 'bg-zinc-200 text-zinc-400' : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  }`}>
                    {item.nextReview}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Vitality & Health Loggers Tab */}
      {activeSubTab === 'checkin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section A: Sleep Tracker Form */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Moon className="w-4.5 h-4.5 text-zinc-500" />
              <span>مراقبة جودة وساعات النوم</span>
            </h3>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              يقوم النوم بترسيخ الروابط الكيميائية للدروس في قرن آمون (Consolidation). عدم كفاية نومك يقلل طاقتك الاستيعابية بنسبة 35% غداً.
            </p>

            {sleepMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs">
                {sleepMessage}
              </div>
            )}

            <form onSubmit={handleSleepSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">موعد الخلود للنوم:</label>
                  <input
                    type="time"
                    required
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1">موعد الاستيقاظ:</label>
                  <input
                    type="time"
                    required
                    value={waketime}
                    onChange={(e) => setWaketime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">جودة نومك الليلة الفائتة:</label>
                <select
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="excellent">ممتازة ونوم عميق (بدون استيقاظ)</option>
                  <option value="good">جيدة (استيقظت مرة واحدة)</option>
                  <option value="fair">متوسطة ومتقطعة</option>
                  <option value="poor">سيئة جداً وأرق مستمر</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-950 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span>تسجيل موعد وجودة النوم</span>
              </button>
            </form>

            {/* Display Sleep Logs list */}
            {sleepLogs.length > 0 && (
              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 text-xs space-y-1.5">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">سجل نومك الأخير:</span>
                {sleepLogs.slice(-3).reverse().map((log, i) => (
                  <div key={log.id || i} className="flex justify-between text-[11px] text-zinc-500">
                    <span>تاريخ {log.date}:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{log.durationHours} ساعة ({log.quality === 'excellent' ? 'نوم عميق ممتاز' : 'جيد/متوسط'})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: Daily Mental & Stress check */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-zinc-500" />
              <span>مقياس التركيز والضغط النفسي اليومي</span>
            </h3>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              تحقق من حالتك الإدراكية لمساعدة الـ AI على تعديل التوصيات وتفادي الاحتراق الأكاديمي.
            </p>

            {checkinMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs">
                {checkinMessage}
              </div>
            )}

            <form onSubmit={handleCheckinSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">مستوى التركيز اليوم (1-5):</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={focusLevel}
                    onChange={(e) => setFocusLevel(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-zinc-100"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-1 font-semibold text-left">الحالي: {focusLevel} / 5</span>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1">مستوى الحماس والدافعية (1-5):</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={motivation}
                    onChange={(e) => setMotivation(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-zinc-100"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-1 font-semibold text-left">الحالي: {motivation} / 5</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">التوتر والضغط النفسي (1-5):</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={stress}
                    onChange={(e) => setStress(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-zinc-100"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-1 font-semibold text-left">الحالي: {stress} / 5</span>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1">الإرهاق الذهني والجسدي (1-5):</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={fatigue}
                    onChange={(e) => setFatigue(Number(e.target.value))}
                    className="w-full accent-zinc-900 dark:accent-zinc-100"
                  />
                  <span className="text-[10px] text-zinc-400 block mt-1 font-semibold text-left">الحالي: {fatigue} / 5</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-950 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span>تسجيل الفحص الذهني والتركيز اليومي</span>
              </button>
            </form>

            {/* Manual Screen Time Input Form */}
            <form onSubmit={handleScreenSubmit} className="pt-4 border-t border-zinc-150 dark:border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">التحكم في وقت استخدام الشاشات والهاتف</h4>
              {screenMessage && (
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-[10px]">
                  {screenMessage}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  placeholder="دقائق استخدام الهاتف اليوم (مثال: 120)"
                  value={screenMinutes}
                  onChange={(e) => setScreenMinutes(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all"
                >
                  حفظ الوقت
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* 3. Burnout Risk Estimator Tab */}
      {activeSubTab === 'burnout' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">مستكشف خطر الإرهاق الأكاديمي (Burnout Predictor)</h3>
                <p className="text-[10px] text-zinc-500">مقياس سلوكي معتمد على أنماط نومك، ضغوطاتك، ووقت المذاكرة المتراكم، بدون تقديم تشخيص طبي.</p>
              </div>
              <Battery className={`w-10 h-10 ${
                burnoutAnalysis.riskLevel === 'high' ? 'text-rose-500' : burnoutAnalysis.riskLevel === 'moderate' ? 'text-amber-500' : 'text-emerald-500'
              }`} />
            </div>

            {/* Burnout risk visual display */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Ring / Percentage display */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 border border-zinc-150 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-950/30">
                <span className="text-xs text-zinc-400 font-bold block mb-2">مقياس خطر الإرهاق</span>
                <div className="relative flex items-center justify-center w-28 h-28">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="46"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      className="text-zinc-200 dark:text-zinc-800"
                    />
                    <circle
                      cx="56"
                      cy="56"
                      r="46"
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 46}
                      strokeDashoffset={2 * Math.PI * 46 * (1 - burnoutAnalysis.score / 100)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      className={`transition-all duration-1000 ${
                        burnoutAnalysis.riskLevel === 'high' ? 'text-rose-500' : burnoutAnalysis.riskLevel === 'moderate' ? 'text-amber-500' : 'text-emerald-500'
                      }`}
                    />
                  </svg>
                  <span className="absolute text-xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
                    {burnoutAnalysis.score}%
                  </span>
                </div>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full mt-3 ${
                  burnoutAnalysis.riskLevel === 'high' 
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300' 
                    : burnoutAnalysis.riskLevel === 'moderate' 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300' 
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                }`}>
                  {burnoutAnalysis.riskLevel === 'high' ? 'خطر مرتفع جداً' : burnoutAnalysis.riskLevel === 'moderate' ? 'إرهاق دراسي متوسط' : 'مستقر وآمن جداً'}
                </span>
              </div>

              {/* Written Explanation */}
              <div className="md:col-span-8 space-y-3 text-right">
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">التقرير العلمي وتحليل عاداتك:</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {burnoutAnalysis.explanation}
                </p>
                <div className="flex gap-4 text-[10px] text-zinc-500 pt-1 border-t border-zinc-150 dark:border-zinc-800">
                  <span>ساعات النوم الأخيرة: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{sleepLogs[sleepLogs.length - 1]?.durationHours || 0}ساعة</strong></span>
                  <span>توتر الفحص اليومي: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{dailyCheckins[dailyCheckins.length - 1]?.stress || 0}/5</strong></span>
                  <span>وقت الشاشة اليومي: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{((screenTimeLogs[screenTimeLogs.length - 1]?.minutes || 0) / 60).toFixed(1)}ساعة</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommended Recovery Strategies */}
          <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <Zap className="w-4.5 h-4.5 text-zinc-950 dark:text-zinc-50" />
              <span>خطة التعافي الفورية الموصى بها لمقاومة الاحتراق:</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {burnoutAnalysis.recommendations.map((rec, index) => (
                <div key={index} className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-850 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-zinc-900 dark:text-zinc-100 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Grades & Evaluation Tab */}
      {activeSubTab === 'grades' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form and Averages column */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Summary statistics */}
            <div className="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-zinc-500">متوسط الدرجات العام لجميع التقييمات:</h3>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold font-mono text-zinc-900 dark:text-zinc-50">
                  {gradesStats.overallAvg}%
                </span>
                <span className="text-[10px] text-zinc-400 font-bold">
                  مستنتجة من {grades.length} واجبات وكويزات سابقة
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div className="bg-zinc-900 dark:bg-zinc-100 h-full transition-all" style={{ width: `${gradesStats.overallAvg}%` }}></div>
              </div>
            </div>

            {/* Add Grade Form */}
            <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Plus className="w-4.5 h-4.5 text-zinc-500" />
                <span>إضافة تقييم / درجة جديدة</span>
              </h3>

              <form onSubmit={handleGradeSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">المادة:</label>
                    <select
                      value={gradeSubjectId}
                      onChange={(e) => setGradeSubjectId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none"
                    >
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name.split(' (')[0]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">نوع التقييم:</label>
                    <select
                      value={gradeCategory}
                      onChange={(e) => setGradeCategory(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none"
                    >
                      <option value="Quiz">كويز / اختبار حصة</option>
                      <option value="Homework">واجب منزلي</option>
                      <option value="Exam">امتحان شامل</option>
                      <option value="Practice Test">حل بنك أسئلة</option>
                      <option value="Assignment">تطبيق عملي</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 mb-1">عنوان التقييم (مثال: واجب العضوية الأول):</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أسئلة التيار المتردد"
                    value={gradeTitle}
                    onChange={(e) => setGradeTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {activeSubjectBranches.length > 0 && (
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">الفرع الدراسي الخاص بهذا التقييم:</label>
                    <select
                      value={gradeBranch}
                      onChange={(e) => setGradeBranch(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                    >
                      {activeSubjectBranches.map((br) => (
                        <option key={br} value={br}>{br}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">الدرجة الحاصل عليها:</label>
                    <input
                      type="number"
                      required
                      placeholder="مثال: 18"
                      value={gradeScore}
                      onChange={(e) => setGradeScore(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-1">الدرجة الكلية القصوى:</label>
                    <input
                      type="number"
                      required
                      placeholder="مثال: 20"
                      value={gradeTotal}
                      onChange={(e) => setGradeTotal(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 mb-1">نقاط الضعف / الفصول الصعبة (اختياري، مفصولة بفواصل):</label>
                  <input
                    type="text"
                    placeholder="مثال: التسمية الشائعة، الأيزوميرات"
                    value={gradeWeak}
                    onChange={(e) => setGradeWeak(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-500 mb-1">نقاط القوة / الفصول المتقنة (اختياري، مفصولة بفواصل):</label>
                  <input
                    type="text"
                    placeholder="مثال: الألكينات، تفاعلات الإضافة"
                    value={gradeStrong}
                    onChange={(e) => setGradeStrong(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-zinc-50 dark:text-zinc-950 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <span>تسجيل التقييم في دفتر الدرجات</span>
                </button>
              </form>
            </div>
          </div>

          {/* Visual Ledger table column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Subject-specific performance breakdown */}
            <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">معدل تحصيل المواد من التقييمات</h3>
              
              {gradesStats.subjectAverages.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-4">قم بتسجيل التقييمات والواجبات لعرض متوسطات المواد هنا.</p>
              ) : (
                <div className="space-y-3">
                  {gradesStats.subjectAverages.map((sub, i) => (
                    <div key={sub.subjectId || i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }}></span>
                          <span>{sub.subjectName} ({sub.count} تقييمات)</span>
                        </span>
                        <span className="font-mono">{sub.avg}%</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${sub.avg}%`, backgroundColor: sub.color }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Diagnostics & Branch-level Strengths & Weaknesses */}
            <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-zinc-800 dark:text-zinc-200" />
                  <span>خبير التشخيص الدراسي للفروع (دفعة ٢٠٢٧)</span>
                </h3>
                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold px-2 py-0.5 rounded-full">
                  تحليل ذكي تلقائي
                </span>
              </div>

              {branchDiagnosis.weaknesses.length === 0 && branchDiagnosis.strengths.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-zinc-150 dark:border-zinc-800 rounded-2xl p-4 bg-zinc-50/30 dark:bg-zinc-950/10">
                  <Sparkles className="w-6.5 h-6.5 text-zinc-400 mx-auto mb-2" />
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                    لا يوجد تحليل فروع حتى الآن
                  </p>
                  <p className="text-[10px] text-zinc-400 max-w-sm mx-auto leading-normal">
                    قم بتسجيل درجات التقييمات والواجبات مع اختيار "الفرع الدراسي" (مثل النحو، أو الكيمياء العضوية) ليقوم المساعد بعرض تقرير فوري بنقاط ضعفك وقوتك وتوصيات للتفوق.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Weaknesses List */}
                  {branchDiagnosis.weaknesses.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>فروع تحتاج إلى تدخل علاجي فوري (أقل من ٨٠٪):</span>
                      </h4>
                      <div className="space-y-2">
                        {branchDiagnosis.weaknesses.map((w, index) => (
                          <div key={index} className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: w.subColor }}></span>
                                <span>{w.subjectName} - فرع: {w.branch}</span>
                              </span>
                              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-100/60 dark:bg-rose-950/40 px-2 py-0.5 rounded text-[10px]">
                                متوسط التحصيل: {w.avg}%
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">
                              💡 <strong className="text-zinc-800 dark:text-zinc-200">التوصية العلمية:</strong> {w.recommendation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths List */}
                  {branchDiagnosis.strengths.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>فروع متميزة ومتقنة (٨٠٪ أو أكثر):</span>
                      </h4>
                      <div className="space-y-2">
                        {branchDiagnosis.strengths.map((s, index) => (
                          <div key={index} className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.subColor }}></span>
                              <span>{s.subjectName} - فرع: {s.branch}</span>
                            </span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/30 px-2 py-0.5 rounded text-[10px]">
                              نسبة الإتقان: {s.avg}% ✨
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* List of recorded grades */}
            <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">دفتر التقييمات التفصيلي</h3>
              
              {grades.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  لا توجد درجات مسجلة بعد في الدفتر.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[300px] overflow-y-auto pr-1">
                  {grades.slice().reverse().map((g) => {
                    const sub = subjectMap[g.subjectId];
                    const percent = Math.round((g.score / g.totalScore) * 100);

                    return (
                      <div key={g.id} className="py-3 flex items-start justify-between gap-3 group">
                        <div className="space-y-1 text-right min-w-0">
                          <strong className="text-xs font-bold text-zinc-900 dark:text-zinc-50 block truncate">
                            {g.title}
                          </strong>
                          <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-zinc-400">
                            <span className="font-bold px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300">
                              {g.category}
                            </span>
                            {sub && (
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sub.color }}></span>
                                <span className="font-bold">{sub.name.split(' (')[0]}</span>
                              </span>
                            )}
                            {g.branch && (
                              <span className="px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-300 font-bold">
                                فرع: {g.branch}
                              </span>
                            )}
                            <span>{g.date}</span>
                          </div>

                          {/* Strong / Weak chapters feedback */}
                          {((g.weakChapters && g.weakChapters.length > 0) || (g.strongChapters && g.strongChapters.length > 0)) && (
                            <div className="space-y-0.5 mt-1.5">
                              {g.strongChapters && g.strongChapters.length > 0 && (
                                <p className="text-[9px] text-emerald-600 font-semibold">متقن: {g.strongChapters.join('، ')}</p>
                              )}
                              {g.weakChapters && g.weakChapters.length > 0 && (
                                <p className="text-[9px] text-rose-600 font-semibold">يحتاج مراجعة: {g.weakChapters.join('، ')}</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-left font-mono">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">{g.score} / {g.totalScore}</span>
                            <span className={`text-[9px] font-bold ${percent >= 85 ? 'text-emerald-500' : percent >= 65 ? 'text-amber-500' : 'text-rose-500'}`}>{percent}%</span>
                          </div>

                          <button
                            onClick={() => onDeleteGrade(g.id)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="حذف الدرجة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
