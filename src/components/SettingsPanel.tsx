/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Save, Download, Key, Shield, User, Bell, Phone } from 'lucide-react';
import { AppStudyState } from '../types';

interface SettingsPanelProps {
  user: { 
    name: string; 
    email: string; 
    stream: 'math' | 'science' | 'literature'; 
    targetPercentage: number;
    phone?: string;
    whatsappReminders?: boolean;
  };
  appData: AppStudyState;
  onUpdateProfile: (profile: { 
    name: string; 
    stream: 'math' | 'science' | 'literature'; 
    targetPercentage: number;
    phone?: string;
    whatsappReminders?: boolean;
  }) => void;
  onUpdatePassword: (password: string) => Promise<boolean>;
  onImportData: (data: AppStudyState) => void;
}

export default function SettingsPanel({ user, appData, onUpdateProfile, onUpdatePassword, onImportData }: SettingsPanelProps) {
  const [name, setName] = useState(user.name);
  const [stream, setStream] = useState<'math' | 'science' | 'literature'>(user.stream);
  const [targetPercentage, setTargetPercentage] = useState(user.targetPercentage);
  const [phone, setPhone] = useState(user.phone || '');
  const [whatsappReminders, setWhatsappReminders] = useState(!!user.whatsappReminders);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [profileStatus, setProfileStatus] = useState<'idle' | 'success'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, stream, targetPercentage, phone, whatsappReminders });
    setProfileStatus('success');
    setTimeout(() => setProfileStatus('idle'), 3000);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordStatus('error');
      return;
    }
    const success = await onUpdatePassword(newPassword);
    if (success) {
      setPasswordStatus('success');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordStatus('error');
    }
    setTimeout(() => setPasswordStatus('idle'), 3000);
  };

  // Data exporter to download JSON backup
  const handleExportData = () => {
    try {
      const fullBackup = {
        exportedAt: new Date().toISOString(),
        user: { name: user.name, email: user.email, stream, targetPercentage },
        data: appData
      };
      const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `thanaweya_study_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export study data:', e);
    }
  };

  // Data importer to restore JSON backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        // The backup can be nested as { data: ... } or flat AppStudyState
        const targetData = parsed.data || parsed;
        
        if (targetData && (Array.isArray(targetData.subjects) || Array.isArray(targetData.sessions) || Array.isArray(targetData.tasks))) {
          onImportData(targetData);
          setImportStatus('success');
          setImportMessage('تم استيراد الملف الدراسي بنجاح وجاري المزامنة السحابية!');
        } else {
          setImportStatus('error');
          setImportMessage('صيغة ملف النسخة الاحتياطية غير صالحة. يرجى اختيار ملف صحيح.');
        }
      } catch (err) {
        setImportStatus('error');
        setImportMessage('حدث خطأ أثناء قراءة الملف. تأكد من سلامة ملف الـ JSON.');
      }
      setTimeout(() => {
        setImportStatus('idle');
        setImportMessage('');
      }, 5000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 text-right" style={{ direction: 'rtl' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            تعديل الملف الدراسي والأهداف
          </h4>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">الاسم ثلاثي أو ثنائي:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-950 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">الشعبة الحالية:</label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl focus:outline-none text-zinc-950 dark:text-zinc-50"
              >
                <option value="math">علمي رياضة 📐</option>
                <option value="science">علمي علوم 🧪</option>
                <option value="literature">أدبي 📚</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">المجموع المستهدف لثانوية عامة (%):</label>
              <input
                type="number"
                min="50"
                max="100"
                step="0.1"
                value={targetPercentage}
                onChange={(e) => setTargetPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl focus:outline-none text-zinc-950 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">رقم الواتساب الخاص بك (تلقي التذكيرات):</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="مثال: 01012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl focus:outline-none text-zinc-950 dark:text-zinc-50 font-mono"
                />
                <Phone className="w-4 h-4 text-zinc-400 absolute right-3 top-3" />
              </div>
            </div>

            {/* Custom Premium Toggle Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                  تفعيل إشعارات التذكير عبر الواتساب
                </label>
                <span className="text-[10px] text-zinc-400 block leading-normal">
                  ربط الجدول الأسبوعي بإرسال رسائل تذكير تلقائية دقيقة على رقمك.
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => setWhatsappReminders(!whatsappReminders)}
                className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-zinc-400 ${
                  whatsappReminders ? 'bg-emerald-600' : 'bg-zinc-250 dark:bg-zinc-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    whatsappReminders ? '-translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              {profileStatus === 'success' && (
                <span className="text-xs text-emerald-500 font-semibold">تم حفظ التعديلات بنجاح!</span>
              )}
              <div className="flex-1"></div>
              <button
                type="submit"
                className="px-5 py-2 bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-semibold text-xs hover:bg-zinc-850 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password settings */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
            <Key className="w-4 h-4" />
            تعديل كلمة المرور للجروب المغلق
          </h4>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">كلمة المرور الجديدة:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة مرور قوية"
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-950 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">تأكيد كلمة المرور:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="أعد كتابتها مرة أخرى"
                className="w-full px-3 py-2 text-sm border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-950 dark:text-zinc-50"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {passwordStatus === 'success' && (
                <span className="text-xs text-emerald-500 font-semibold">تم تحديث كلمة المرور!</span>
              )}
              {passwordStatus === 'error' && (
                <span className="text-xs text-red-500 font-semibold">غير متطابقين أو فشل التعديل!</span>
              )}
              <div className="flex-1"></div>
              <button
                type="submit"
                className="px-5 py-2 bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl font-semibold text-xs hover:bg-zinc-850 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                <span>تحديث الرمز السري</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Export & Import Study Data & Privacy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-2">تصدير نسخة احتياطية (Export JSON)</h4>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              قم بتنزيل ملف JSON يحتوي على كافة بياناتك (جلسات المذاكرة، الجدول الأسبوعي، الدرجات، الإحصائيات، المهام، والأهداف الشخصية) للاحتفاظ بنسخة مادية آمنة على جهازك.
            </p>
          </div>
          <button
            onClick={handleExportData}
            className="w-full py-3 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2.5"
          >
            <Download className="w-4 h-4" />
            <span>تصدير الملف الدراسي الكامل للكمبيوتر (JSON)</span>
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-2">استيراد نسخة احتياطية (Import JSON)</h4>
            <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
              استرجع بياناتك بالكامل من ملف نسخة احتياطية قمت بتصديره مسبقاً. سيتم استبدال البيانات الحالية على الفور ومزامنتها سحابياً تلقائياً.
            </p>
          </div>
          <div className="space-y-3">
            {importMessage && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold ${
                importStatus === 'success' ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
              }`}>
                {importMessage}
              </div>
            )}
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
                id="import-file-input"
              />
              <label
                htmlFor="import-file-input"
                className="w-full py-3 border border-dashed border-zinc-350 dark:border-zinc-750 hover:border-zinc-500 text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900 rounded-xl font-semibold text-xs cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                <span>اختيار ملف النسخة الاحتياطية واستعادته</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
