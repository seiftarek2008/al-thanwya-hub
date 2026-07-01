/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, Award, Calendar, ChevronRight, TrendingUp, Sparkles, Trash } from 'lucide-react';
import { Exam, Subject } from '../types';

interface ExamsTrackerProps {
  exams: Exam[];
  subjects: Subject[];
  onAddExam: (exam: Omit<Exam, 'id'>) => void;
  onRecordGrade: (id: string, score: number) => void;
  onDeleteExam: (id: string) => void;
  consistencyScore: number;
}

export default function ExamsTracker({ exams, subjects, onAddExam, onRecordGrade, onDeleteExam, consistencyScore }: ExamsTrackerProps) {
  const [title, setTitle] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalScore, setTotalScore] = useState(60); // 60 is standard in many Thanaweya Amma exams
  const [preparationLevel, setPreparationLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [scoreInput, setScoreInput] = useState<{ [id: string]: string }>({});

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    onAddExam({
      title: title.trim(),
      subjectId: selectedSubjectId,
      date,
      totalScore: Number(totalScore),
      preparationLevel
    });

    setTitle('');
  };

  const subjectMap = useMemo(() => {
    const map: { [id: string]: Subject } = {};
    subjects.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [subjects]);

  // Calculations
  const gradedExams = useMemo(() => exams.filter((e) => e.score !== undefined), [exams]);
  
  const averageGradePercent = useMemo(() => {
    if (gradedExams.length === 0) return 0;
    const totalPerc = gradedExams.reduce((acc, e) => {
      const score = e.score || 0;
      return acc + (score / e.totalScore) * 100;
    }, 0);
    return Math.round(totalPerc / gradedExams.length);
  }, [gradedExams]);

  // AI Predictor Model
  const predictedFinalScore = useMemo(() => {
    // Thanaweya Amma is out of 320 marks under the new 2027 restructured system. Let's calculate based on averages & consistency
    const basePrediction = averageGradePercent > 0 ? averageGradePercent : 75; // fallback to 75%
    const consistencyMultiplier = (consistencyScore - 50) / 100 * 5; // adds up to +2.5% or down to -2.5%
    const finalPercent = Math.min(Math.max(Math.round(basePrediction + consistencyMultiplier), 50), 100);
    const finalMarks = Number(((finalPercent / 100) * 320).toFixed(1));
    return { percent: finalPercent, marks: finalMarks };
  }, [averageGradePercent, consistencyScore]);

  return (
    <div className="space-y-6 text-right" style={{ direction: 'rtl' }}>
      {/* Grade Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Average */}
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 mb-2">
            <span>متوسط درجات الامتحانات</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
            {gradedExams.length > 0 ? `${averageGradePercent}%` : 'لا يوجد نتائج بعد'}
          </h3>
          <p className="text-[10px] text-zinc-400 mt-1">تم حسابها من أصل {gradedExams.length} امتحانات شاملة</p>
        </div>

        {/* AI Final Predicted Score */}
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 md:col-span-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 dark:text-zinc-600 mb-2">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              الدرجة المتوقعة لثانوية عامة دفعة ٢٠٢٧ (AI Predictor)
            </span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex justify-between items-end mt-4">
            <div>
              <h3 className="text-3xl font-bold font-mono text-amber-400 dark:text-zinc-900">
                {predictedFinalScore.marks} <span className="text-xs font-normal text-zinc-400 dark:text-zinc-600">/ ٣٢٠ درجة (النظام الجديد)</span>
              </h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                النسبة المئوية التقريبية: {predictedFinalScore.percent}% (مبنية على أدائك الحالي واستمراريتك بمعدل {consistencyScore}%)
              </p>
            </div>
            <div className="text-right text-[10px] text-zinc-400 dark:text-zinc-500 hidden sm:block">
              * التوقع يتم تحديثه تلقائياً بناءً على متوسط الدرجات ومستوى انضباطك الدراسي.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule/Add Exam form */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            جدولة امتحان تجريبي / شامل
          </h4>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">اسم الامتحان:</label>
              <input
                type="text"
                placeholder="مثال: الباب الأول، امتحان تجريبي عام.."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-950 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">المادة الحالية:</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-950 dark:text-zinc-50"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">الدرجة الكلية للامتحان:</label>
                <input
                  type="number"
                  value={totalScore}
                  onChange={(e) => setTotalScore(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl focus:outline-none text-zinc-950 dark:text-zinc-50"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">مستوى الاستعداد الحسي:</label>
                <select
                  value={preparationLevel}
                  onChange={(e) => setPreparationLevel(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl focus:outline-none text-zinc-950 dark:text-zinc-50"
                >
                  <option value="high">مستعد تماماً</option>
                  <option value="medium">استعداد متوسط</option>
                  <option value="low">غير جاهز كفاية</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1">تاريخ الامتحان:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl focus:outline-none text-zinc-950 dark:text-zinc-50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-semibold text-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل الموعد</span>
            </button>
          </form>
        </div>

        {/* Scheduled/Graded exams lists */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 lg:col-span-2">
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4">الامتحانات والنتائج المسجلة</h4>
          
          {exams.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <p className="text-xs font-semibold">لم تسجل أي امتحانات تصفية حتى الآن.</p>
              <p className="text-[10px] text-zinc-400 mt-1">ابدأ بجدولة امتحانك الأول لضمان تدريب عصبك الدراسي.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => {
                const sub = subjectMap[exam.subjectId];
                return (
                  <div
                    key={exam.id}
                    className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-50">{exam.title}</span>
                        {sub && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full text-zinc-50 font-medium"
                            style={{ backgroundColor: sub.color }}
                          >
                            {sub.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400">
                        <span className="font-mono">{exam.date}</span>
                        <span>•</span>
                        <span>جاهزية: {exam.preparationLevel === 'high' ? 'قوية 🚀' : exam.preparationLevel === 'medium' ? 'متوسطة ⚡' : 'محتاجة مجهود ⚠️'}</span>
                      </div>
                    </div>

                    {/* Score section */}
                    <div className="flex items-center gap-2">
                      {exam.score !== undefined ? (
                        <span className="text-sm font-bold font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900">
                          {exam.score} / {exam.totalScore} ({Math.round((exam.score / exam.totalScore) * 100)}%)
                        </span>
                      ) : (
                        <div className="flex gap-1.5 items-center">
                          <input
                            type="number"
                            placeholder="الدرجة"
                            value={scoreInput[exam.id] || ''}
                            onChange={(e) => setScoreInput({ ...scoreInput, [exam.id]: e.target.value })}
                            className="w-16 px-2 py-1 text-xs text-center border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              const scoreVal = Number(scoreInput[exam.id]);
                              if (isNaN(scoreVal) || scoreVal < 0 || scoreVal > exam.totalScore) return;
                              onRecordGrade(exam.id, scoreVal);
                            }}
                            className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors"
                          >
                            تثبيت الدرجة
                          </button>
                        </div>
                      )}
                      
                      <button
                        onClick={() => onDeleteExam(exam.id)}
                        className="p-1 text-zinc-400 hover:text-red-500 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <Trash className="w-3.5 h-3.5" />
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
  );
}
