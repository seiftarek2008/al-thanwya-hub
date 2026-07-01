/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Check, Zap, AlertCircle } from 'lucide-react';
import { StudyMethod } from '../types';

interface TimerProps {
  subjects: { id: string; name: string; color: string }[];
  onSessionComplete: (session: {
    subjectId: string;
    subjectName: string;
    duration: number;
    method: StudyMethod;
    focusScore: number;
  }) => void;
}

export default function Timer({ subjects, onSessionComplete }: TimerProps) {
  const [mode, setMode] = useState<StudyMethod | 'Short Break' | 'Long Break'>('Pomodoro');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [duration, setDuration] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [focusScore, setFocusScore] = useState(80);
  const [savePrompt, setSavePrompt] = useState(false);

  // Audio Synth triggers
  const playAlertSound = (isBreak: boolean) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (isBreak) {
        // High pleasant pitch
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } else {
        // Low focus chime
        osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
        osc.start();
        osc.stop(ctx.currentTime + 1.5);
      }
    } catch (e) {
      console.warn('AudioContext blocked or unsupported:', e);
    }
  };

  useEffect(() => {
    // Reset timer on mode change
    let mins = 25;
    if (mode === 'Deep Work') mins = 50;
    else if (mode === 'Short Break') mins = 5;
    else if (mode === 'Long Break') mins = 15;
    else if (mode === 'Revision') mins = 30;
    else if (mode === 'Practice Questions') mins = 45;

    setTimeLeft(mins * 60);
    setDuration(mins * 60);
    setIsRunning(false);
    setSavePrompt(false);
  }, [mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playAlertSound(mode.includes('Break'));
      if (mode !== 'Short Break' && mode !== 'Long Break') {
        setSavePrompt(true);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration);
    setSavePrompt(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveSession = () => {
    const sub = subjects.find(s => s.id === selectedSubjectId);
    if (!sub) return;
    
    onSessionComplete({
      subjectId: sub.id,
      subjectName: sub.name,
      duration: duration - timeLeft,
      method: (mode === 'Short Break' || mode === 'Long Break') ? 'Pomodoro' : mode as StudyMethod,
      focusScore: focusScore
    });

    setSavePrompt(false);
    handleReset();
  };

  const progress = timeLeft / duration;
  const strokeDashoffset = 2 * Math.PI * 90 * (1 - progress);

  return (
    <div className={`p-6 rounded-2xl border transition-all duration-300 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 ${isFullScreen ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 dark:bg-zinc-950 border-none' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6 max-w-md">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
            {isFullScreen ? 'جلسة عمل عميق' : 'مؤقت التركيز الذكي'}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {mode === 'Short Break' || mode === 'Long Break' ? 'استرخ واشحن طاقتك الذهنية' : 'اضبط المؤقت وابدأ رحلة التفوق'}
          </p>
        </div>
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Mode Switches */}
      <div className="flex flex-wrap gap-2 justify-center mb-6 max-w-md">
        {(['Pomodoro', 'Deep Work', 'Short Break', 'Long Break', 'Revision', 'Practice Questions'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
              mode === m
                ? 'bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-sm'
                : 'bg-zinc-50 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {m === 'Pomodoro' ? 'بومودورو (٢٥د)' : m === 'Deep Work' ? 'عمل عميق (٥٠د)' : m === 'Short Break' ? 'راحة قصيرة (٥د)' : m === 'Long Break' ? 'راحة طويلة (١٥د)' : m === 'Revision' ? 'مراجعة (٣٠د)' : 'حل أسئلة (٤٥د)'}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative flex items-center justify-center w-64 h-64 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="90"
            className="stroke-zinc-100 dark:stroke-zinc-900"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="128"
            cy="128"
            r="90"
            className="stroke-zinc-900 dark:stroke-zinc-100 transition-all duration-300"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Counter Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-mono font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs text-zinc-500 mt-1 dark:text-zinc-400">
            {isRunning ? 'مستمر الآن' : 'متوقف'}
          </span>
        </div>
      </div>

      {/* Subject selector for studies */}
      {!(mode === 'Short Break' || mode === 'Long Break') && (
        <div className="mb-6 max-w-sm w-full mx-auto">
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 text-right">
            المادة الحالية لمذاكرتها:
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            disabled={isRunning}
            className="w-full px-3 py-2 text-sm text-right rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4 max-w-md w-full mx-auto">
        <button
          onClick={handleReset}
          className="p-3 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={handleStartPause}
          className="px-6 py-3 rounded-full font-semibold text-sm transition-all shadow-md flex items-center gap-2 bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200"
        >
          {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          {isRunning ? 'إيقاف مؤقت' : 'ابدأ التركيز'}
        </button>

        {timeLeft < duration && !isRunning && (
          <button
            onClick={() => setSavePrompt(true)}
            className="p-3 rounded-full border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 transition-all"
            title="حفظ الجلسة الدراسية"
          >
            <Check className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Save Session Prompt */}
      {savePrompt && (
        <div className="mt-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 max-w-md w-full mx-auto">
          <div className="flex items-start gap-2 text-right dir-rtl mb-4">
            <AlertCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">هل ترغب في تسجيل جلسة المذاكرة الحالية؟</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">المذاكرة المتراكمة يتم حسابها ضمن الإحصائيات الذكية ومستويات طاقتك المعرفية.</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1 text-xs text-zinc-600 dark:text-zinc-400">
              <span>{focusScore}%</span>
              <span>مدى تركيزك في هذه الجلسة:</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              value={focusScore}
              onChange={(e) => setFocusScore(Number(e.target.value))}
              className="w-full accent-zinc-900 dark:accent-zinc-100 bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setSavePrompt(false)}
              className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-medium"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveSession}
              className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm"
            >
              تسجيل المذاكرة
            </button>
          </div>
        </div>
      )}

      {/* Cinematic Breathing Circle for Full-screen focus */}
      {isFullScreen && isRunning && (
        <div className="mt-8 flex flex-col items-center justify-center animate-pulse">
          <div className="w-16 h-16 rounded-full border border-zinc-700 bg-zinc-800/20 animate-[ping_3s_infinite] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-zinc-500/30"></div>
          </div>
          <span className="text-xs font-medium text-zinc-500 mt-4 tracking-wider">تنفس ببطء وعمق.. ركز انتباهك هنا فقط.</span>
        </div>
      )}
    </div>
  );
}
