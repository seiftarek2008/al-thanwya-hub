/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, BookOpen, Trash, Edit2, Check, Target } from 'lucide-react';
import { Subject } from '../types';

interface SubjectsManagerProps {
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id' | 'totalMinutes'>) => void;
  onEditSubject: (id: string, updated: Partial<Subject>) => void;
  onDeleteSubject: (id: string) => void;
  onResetSubjects?: () => void;
}

export default function SubjectsManager({ subjects, onAddSubject, onEditSubject, onDeleteSubject, onResetSubjects }: SubjectsManagerProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#FF5733');
  const [targetHours, setTargetHours] = useState(5); // target hours per week
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editHours, setEditHours] = useState(5);

  const colorsList = [
    '#FF5733', // Coral
    '#33FF57', // Lime
    '#3357FF', // Indigo
    '#F3FF33', // Yellow
    '#FF33F3', // Fuchsia
    '#00F0FF', // Cyan
    '#FF9F00', // Orange
    '#9B51E0'  // Purple
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddSubject({
      name: name.trim(),
      color,
      icon: 'BookOpen',
      targetMinutesPerWeek: targetHours * 60
    });

    setName('');
  };

  const handleStartEdit = (sub: Subject) => {
    setEditingId(sub.id);
    setEditName(sub.name);
    setEditHours(sub.targetMinutesPerWeek / 60);
  };

  const handleSaveEdit = (id: string) => {
    onEditSubject(id, {
      name: editName,
      targetMinutesPerWeek: editHours * 60
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 text-right" style={{ direction: 'rtl' }}>
      {/* Add New Subject */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-500 animate-pulse" />
          إضافة مادة دراسية لجدول المذاكرة
        </h3>
        
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">اسم المادة:</label>
              <input
                type="text"
                placeholder="مثال: الكيمياء العضوية، النحو، الفيزياء الكهربية.."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-950 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">الهدف الأسبوعي للمذاكرة (بالساعات):</label>
              <input
                type="number"
                min="1"
                max="40"
                value={targetHours}
                onChange={(e) => setTargetHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl focus:outline-none text-zinc-950 dark:text-zinc-50"
              />
            </div>
          </div>

          {/* Color Palettes Selection */}
          <div>
            <label className="block text-xs text-zinc-500 mb-2">اختر لون التمييز البصري لمخططات المذاكرة والمؤقت:</label>
            <div className="flex gap-2.5 flex-wrap">
              {colorsList.map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setColor(col)}
                  className={`w-8 h-8 rounded-full transition-transform duration-150 ${
                    color === col ? 'scale-110 ring-2 ring-zinc-400 dark:ring-zinc-500' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: col }}
                ></button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 font-semibold rounded-xl text-xs hover:bg-zinc-850 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل المادة</span>
            </button>
          </div>
        </form>
      </div>

      {/* List Subjects */}
      <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">قائمة المواد الحالية وأهدافها المسجلة</h4>
          {onResetSubjects && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('هل أنت متأكد من إعادة تهيئة جميع المواد الدراسية إلى المواد الافتراضية لشعبتك الحالية؟ سيؤدي هذا لاستبدال المواد الحالية.')) {
                  onResetSubjects();
                }
              }}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5"
            >
              <span>إعادة ضبط المواد الافتراضية 🔄</span>
            </button>
          )}
        </div>
        
        {subjects.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-zinc-400" />
            <p className="text-xs font-semibold">لم تسجل أي مواد حتى الآن.</p>
            <p className="text-[10px] text-zinc-400 mt-1">المواد تساعدك على تصنيف إحصائياتك تلقائياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl border border-zinc-150 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 w-full">
                  <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color }}></span>
                  
                  {editingId === sub.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none"
                      />
                      <input
                        type="number"
                        value={editHours}
                        onChange={(e) => setEditHours(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 text-center focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveEdit(sub.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h5 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{sub.name}</h5>
                      <span className="text-[10px] text-zinc-400">الهدف: {sub.targetMinutesPerWeek / 60} ساعة أسبوعياً</span>
                    </div>
                  )}
                </div>

                {editingId !== sub.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(sub)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSubject(sub.id)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
