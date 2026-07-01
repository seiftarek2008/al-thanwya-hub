/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, FileText, HelpCircle, Calendar, MessageSquare, ListCollapse } from 'lucide-react';
import { ChatMessage } from '../types';

interface AIChatbotProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => Promise<string>;
}

export default function AIChatbot({ chatHistory, onSendMessage }: AIChatbotProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    setIsLoading(true);
    setInput('');
    try {
      await onSendMessage(textToSend);
    } catch (e) {
      console.error('Error sending message:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'شرح مبسط لدرس', icon: BookOpen, prompt: 'اشرحلي درس تفاعلات الكيمياء العضوية أو درس المغناطيسية بأسلوب مبسط وشيق مع أمثلة عملية من منهج الثانوية العامة.' },
    { label: 'تلخيص ملاحظاتي', icon: FileText, prompt: 'لخصلي الدرس ده في شكل نقاط تذكيرية سريعة وممتازة للتكرار المتباعد:\n[اكتب ملاحظاتك أو الدرس هنا]' },
    { label: 'امتحان (كويز)', icon: HelpCircle, prompt: 'اعملي كويز سريع من 3 أسئلة اختيار من متعدد (MCQs) في الفيزياء أو الكيمياء أو النحو مع شرح إجابة كل سؤال بعد ما أجاوبك.' },
    { label: 'بطاقات استذكار', icon: ListCollapse, prompt: 'صمملي 3 بطاقات استذكار (Flashcards) للوجه والظهر لمراجعة وحفظ مفاهيم البلاغة أو قوانين الفيزياء الكهربية.' },
    { label: 'جدول مراجعة مخصص', icon: Calendar, prompt: 'اعملي جدول مراجعة مخصص لـ 5 أيام لتقسيم مادة الكيمياء مع تحديد وقت المذاكرة ووقت الراحة المناسب عصبياً.' },
  ];

  return (
    <div className="flex flex-col h-[600px] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
      {/* Bot Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3 text-right">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-zinc-50 dark:text-zinc-950 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-1">
              <span>معلم AI</span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-medium">نشط</span>
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">مستشارك لتبسيط مناهج ثانوية عامة وحل الأسئلة 🧠</p>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-50/30 dark:bg-zinc-950/10">
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-zinc-900 text-zinc-50 rounded-br-none font-medium'
                  : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-bl-none text-right'
              }`}
              style={{ direction: msg.role === 'user' ? 'ltr' : 'rtl' }}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1">
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={feedEndRef} />
      </div>

      {/* Quick Prompt Cards */}
      {chatHistory.length <= 1 && !isLoading && (
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-3 text-right">أفكار مخصصة للبدء بسرعة:</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                className="flex-shrink-0 snap-end flex items-center gap-2 px-3 py-2 text-xs font-medium bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl transition-all"
              >
                <qp.icon className="w-3.5 h-3.5 text-zinc-500" />
                <span>{qp.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2"
        >
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-zinc-950 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-950 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-950 dark:disabled:hover:bg-zinc-50 transition-colors"
          >
            <Send className="w-4 h-4 transform rotate-180" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل معلم AI عن أي شيء في المنهج.. كيمياء، فيزياء، نحو"
            className="flex-1 px-4 py-2 text-sm text-right bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            disabled={isLoading}
          />
        </form>
      </div>
    </div>
  );
}
