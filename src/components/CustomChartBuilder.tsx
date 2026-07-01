import React, { useState, useMemo } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  PieChart, 
  Sliders, 
  HelpCircle, 
  Info,
  Calendar,
  CheckCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import { Subject, StudySession, Exam, GradeRecord } from '../types';

interface CustomChartBuilderProps {
  subjects: Subject[];
  sessions: StudySession[];
  exams?: Exam[];
  grades?: GradeRecord[];
}

type ChartMetric = 'hours' | 'grades';
type ChartXAxis = 'subject' | 'date';
type ChartType = 'bar' | 'line' | 'area' | 'pie';

export default function CustomChartBuilder({ 
  subjects = [], 
  sessions = [], 
  exams = [], 
  grades = [] 
}: CustomChartBuilderProps) {
  
  // Selection States
  const [metric, setMetric] = useState<ChartMetric>('hours');
  const [xAxis, setXAxis] = useState<ChartXAxis>('subject');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [hoveredData, setHoveredData] = useState<any | null>(null);

  const subjectMap = useMemo(() => {
    const map: { [id: string]: Subject } = {};
    subjects.forEach(s => { map[s.id] = s; });
    return map;
  }, [subjects]);

  // Combined Evaluation Records (Exams + Grades)
  const scoreRecords = useMemo(() => {
    const records: Array<{ id: string; subjectId: string; title: string; score: number; totalScore: number; date: string; percentage: number }> = [];
    
    // Add from exams
    exams.forEach(ex => {
      if (ex.score !== undefined) {
        records.push({
          id: ex.id,
          subjectId: ex.subjectId,
          title: ex.title,
          score: ex.score,
          totalScore: ex.totalScore,
          date: ex.date,
          percentage: Math.round((ex.score / ex.totalScore) * 100)
        });
      }
    });

    // Add from grades
    grades.forEach(gr => {
      records.push({
        id: gr.id,
        subjectId: gr.subjectId,
        title: gr.title,
        score: gr.score,
        totalScore: gr.totalScore,
        date: gr.date,
        percentage: Math.round((gr.score / gr.totalScore) * 100)
      });
    });

    // Sort by date ascending
    return records.sort((a, b) => a.date.localeCompare(b.date));
  }, [exams, grades]);

  // Aggregate Data based on selections
  const chartData = useMemo(() => {
    const filteredSessions = selectedSubjectId === 'all' 
      ? sessions 
      : sessions.filter(s => s.subjectId === selectedSubjectId);

    const filteredScores = selectedSubjectId === 'all'
      ? scoreRecords
      : scoreRecords.filter(r => r.subjectId === selectedSubjectId);

    // Scenario 1: Metric = HOURS, XAxis = SUBJECT
    if (metric === 'hours' && xAxis === 'subject') {
      return subjects.map(sub => {
        const totalSecs = sessions
          .filter(s => s.subjectId === sub.id)
          .reduce((acc, s) => acc + s.duration, 0);
        return {
          label: sub.name.split(' (')[0],
          value: Number((totalSecs / 3600).toFixed(1)), // in hours
          color: sub.color,
          details: `إجمالي الجلسات: ${sessions.filter(s => s.subjectId === sub.id).length} جلسة`
        };
      });
    }

    // Scenario 2: Metric = HOURS, XAxis = DATE (Chronological Date Grouping)
    if (metric === 'hours' && xAxis === 'date') {
      // Group by date of last 10 days with activity
      const dateGroups: { [date: string]: { value: number; colors: Set<string>; count: number } } = {};
      
      // Seed last 7 calendar days to make sure the flow looks complete
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dateGroups[dateStr] = { value: 0, colors: new Set(), count: 0 };
      }

      filteredSessions.forEach(s => {
        const dateStr = s.timestamp.split('T')[0];
        if (!dateGroups[dateStr]) {
          dateGroups[dateStr] = { value: 0, colors: new Set(), count: 0 };
        }
        dateGroups[dateStr].value += s.duration / 3600;
        dateGroups[dateStr].count += 1;
        const sub = subjectMap[s.subjectId];
        if (sub) dateGroups[dateStr].colors.add(sub.color);
      });

      return Object.keys(dateGroups)
        .sort()
        .map(date => {
          const item = dateGroups[date];
          const colorsArr = Array.from(item.colors);
          const displayDate = new Date(date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
          return {
            label: displayDate,
            value: Number(item.value.toFixed(1)),
            color: colorsArr[0] || '#9ca3af',
            details: `التاريخ: ${date} | جلسات: ${item.count}`
          };
        });
    }

    // Scenario 3: Metric = GRADES, XAxis = SUBJECT
    if (metric === 'grades' && xAxis === 'subject') {
      return subjects.map(sub => {
        const subScores = scoreRecords.filter(r => r.subjectId === sub.id);
        if (subScores.length === 0) {
          return {
            label: sub.name.split(' (')[0],
            value: 0,
            color: sub.color,
            details: 'لا توجد تقييمات مسجلة بعد'
          };
        }
        const avgPercentage = subScores.reduce((acc, s) => acc + s.percentage, 0) / subScores.length;
        return {
          label: sub.name.split(' (')[0],
          value: Math.round(avgPercentage), // Average score percentage
          color: sub.color,
          details: `عدد الاختبارات: ${subScores.length} | متوسط التحصيل`
        };
      });
    }

    // Scenario 4: Metric = GRADES, XAxis = DATE (Scores chronological feed)
    if (metric === 'grades' && xAxis === 'date') {
      if (filteredScores.length === 0) {
        return [];
      }
      return filteredScores.map(score => {
        const sub = subjectMap[score.subjectId];
        const displayDate = new Date(score.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
        return {
          label: score.title.length > 15 ? score.title.substring(0, 15) + '...' : score.title,
          value: score.percentage, // Score percentage
          color: sub?.color || '#FF33F3',
          details: `التاريخ: ${score.date} | المادة: ${sub?.name.split(' (')[0] || ''} | الدرجة: ${score.score} من ${score.totalScore}`
        };
      });
    }

    return [];
  }, [metric, xAxis, selectedSubjectId, sessions, subjects, scoreRecords, subjectMap]);

  // Max value calculation for scaling
  const maxValue = useMemo(() => {
    const vals = chartData.map(d => d.value);
    const max = Math.max(...vals, 0);
    return max > 0 ? max : (metric === 'hours' ? 5 : 100);
  }, [chartData, metric]);

  // Donut/Pie helper calculations
  const pieSlices = useMemo(() => {
    if (chartType !== 'pie') return [];
    const total = chartData.reduce((acc, d) => acc + d.value, 0);
    if (total === 0) return [];

    let accumulatedAngle = 0;
    return chartData.map(d => {
      const percentage = (d.value / total) * 100;
      const angle = (d.value / total) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;

      // Coordinate math for SVG paths
      const radius = 80;
      const x1 = 100 + radius * Math.cos((startAngle - 90) * Math.PI / 180);
      const y1 = 100 + radius * Math.sin((startAngle - 90) * Math.PI / 180);
      const x2 = 100 + radius * Math.cos((accumulatedAngle - 90) * Math.PI / 180);
      const y2 = 100 + radius * Math.sin((accumulatedAngle - 90) * Math.PI / 180);
      const largeArcFlag = angle > 180 ? 1 : 0;

      // Inner donut circle coordinates
      const innerRadius = 50;
      const ix1 = 100 + innerRadius * Math.cos((accumulatedAngle - 90) * Math.PI / 180);
      const iy1 = 100 + innerRadius * Math.sin((accumulatedAngle - 90) * Math.PI / 180);
      const ix2 = 100 + innerRadius * Math.cos((startAngle - 90) * Math.PI / 180);
      const iy2 = 100 + innerRadius * Math.sin((startAngle - 90) * Math.PI / 180);

      const pathData = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${ix1} ${iy1}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}
        Z
      `;

      return {
        ...d,
        percentage: Math.round(percentage),
        pathData
      };
    });
  }, [chartData, chartType]);

  return (
    <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-6 text-right" style={{ direction: 'rtl' }}>
      
      {/* Chart Title & Config Intro */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            <span>محلل المجهود والرسوم البيانية المخصصة</span>
          </h3>
          <p className="text-[11px] text-zinc-400 leading-normal">
            قم ببناء الرسم البياني الخاص بك لمتابعة الساعات أو الدرجات، واختيار محاور العرض والتصميم الذي تفضله لتحليل مستوى أدائك بدقة.
          </p>
        </div>

        {/* Filters Button */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-150 dark:border-zinc-800">
          <Sliders className="w-3.5 h-3.5" />
          <span>لوحة التحكم والتخصيص</span>
        </div>
      </div>

      {/* Control Knobs / Selectors Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* Metric Picker */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-zinc-400">مؤشر التحليل:</label>
          <select
            value={metric}
            onChange={(e) => {
              const val = e.target.value as ChartMetric;
              setMetric(val);
              // Auto set appropriate X-axis
              if (val === 'grades' && xAxis === 'date' && scoreRecords.length === 0) {
                setXAxis('subject');
              }
            }}
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-800 dark:text-zinc-100 font-semibold"
          >
            <option value="hours">ساعات المذاكرة المنجزة ⏱️</option>
            <option value="grades">درجات الاختبارات والواجبات 🏆</option>
          </select>
        </div>

        {/* X Axis Picker */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-zinc-400">تجميع المحور السيني (X-Axis):</label>
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value as ChartXAxis)}
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-800 dark:text-zinc-100 font-semibold"
          >
            <option value="subject">لكل مادة (By Subject)</option>
            <option value="date">حسب تسلسل الأيام / التواريخ (By Date)</option>
          </select>
        </div>

        {/* Subject Filter */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-zinc-400">تخصيص المواد:</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            disabled={xAxis === 'subject'} // Not applicable when grouping by subjects
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-800 dark:text-zinc-100 disabled:opacity-50"
          >
            <option value="all">كل المواد (All Subjects)</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name.split(' (')[0]}</option>
            ))}
          </select>
        </div>

        {/* Chart Type Picker */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-zinc-400">نوع الرسم البياني:</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-800 dark:text-zinc-100 font-semibold"
          >
            <option value="bar">📊 أعمدة تفاعلية (Bar)</option>
            <option value="line">📈 منحنى بياني (Line)</option>
            <option value="area">⛰️ مساحة ممتلئة (Area)</option>
            <option value="pie">🍩 مخطط الدائرة (Pie/Donut)</option>
          </select>
        </div>

      </div>

      {/* Main Dynamic Chart Stage */}
      <div className="p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 relative min-h-[300px] flex items-center justify-center">
        {chartData.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 text-xs flex flex-col items-center gap-2">
            <Info className="w-8 h-8 text-zinc-300" />
            <span>لا توجد بيانات دراسية كافية لرسم المخطط المختار حالياً.</span>
            <span>ابدأ بتسجيل جلسات مذاكرة أو رصد درجات الاختبارات للبدء!</span>
          </div>
        ) : chartType === 'pie' ? (
          /* ================= PIE / DONUT CHART ================= */
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 w-full py-6">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {pieSlices.map((slice, idx) => (
                  <path
                    key={idx}
                    d={slice.pathData}
                    fill={slice.color}
                    className="transition-all duration-300 hover:opacity-85 cursor-pointer origin-center"
                    onMouseEnter={() => setHoveredData(slice)}
                    onMouseLeave={() => setHoveredData(null)}
                  />
                ))}
              </svg>
            </div>
            
            {/* Legend keys */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-3 text-xs w-full max-w-xs">
              {pieSlices.map((slice, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 shadow-sm"
                  onMouseEnter={() => setHoveredData(slice)}
                  onMouseLeave={() => setHoveredData(null)}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></span>
                  <div className="text-right flex-1 truncate">
                    <strong className="font-bold text-zinc-800 dark:text-zinc-200 block truncate">{slice.label}</strong>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {slice.value} {metric === 'hours' ? 'ساعة' : '%'} ({slice.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ================= SVG AXES-BASED CHARTS (Bar, Line, Area) ================= */
          <div className="w-full h-64 flex flex-col justify-between pt-6">
            <div className="relative flex-1 w-full flex items-end justify-between px-2.5">
              
              {/* Backing Horizontal Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-zinc-200 dark:border-zinc-800 pb-1">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="border-t border-dashed border-zinc-200 dark:border-zinc-900 w-full flex justify-between items-start text-[8px] text-zinc-400 pt-0.5">
                    <span>{Math.round(maxValue - (maxValue / 3) * i)} {metric === 'hours' ? 'س' : '%'}</span>
                  </div>
                ))}
              </div>

              {/* Chart elements */}
              {chartType === 'bar' && (
                <div className="absolute inset-0 flex items-end justify-around px-8 z-10">
                  {chartData.map((d, idx) => {
                    const heightPercent = Math.max((d.value / maxValue) * 100, 3);
                    return (
                      <div 
                        key={idx} 
                        className="flex flex-col items-center group w-[10%] relative"
                        onMouseEnter={() => setHoveredData(d)}
                        onMouseLeave={() => setHoveredData(null)}
                      >
                        {/* Bar Segment */}
                        <div
                          className="w-full hover:brightness-110 rounded-t-lg transition-all duration-500 ease-out cursor-pointer shadow-sm"
                          style={{ 
                            height: `${heightPercent}%`, 
                            backgroundColor: d.color,
                            minHeight: '6px'
                          }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Line & Area Charts using SVG vector coordinates */}
              {(chartType === 'line' || chartType === 'area') && (
                <div className="absolute inset-x-0 bottom-0 top-0 z-10 px-10">
                  <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="none">
                    {/* Define gradients */}
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {(() => {
                      const count = chartData.length;
                      if (count === 0) return null;
                      const stepX = 500 / (count > 1 ? count - 1 : 1);
                      
                      // Calculate point coords
                      const points = chartData.map((d, idx) => {
                        const x = idx * stepX;
                        // Invert Y because SVG 0 is top
                        const y = 200 - (d.value / maxValue) * 180 - 10;
                        return { x, y, d };
                      });

                      // Construct path strings
                      const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                      const areaPath = linePath ? `${linePath} L 500 200 L 0 200 Z` : '';

                      return (
                        <>
                          {chartType === 'area' && (
                            <path d={areaPath} fill="url(#areaGrad)" className="transition-all duration-500" />
                          )}
                          
                          {/* Continuous line */}
                          <path 
                            d={linePath} 
                            fill="none" 
                            stroke="#4f46e5" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="transition-all duration-500" 
                          />

                          {/* Data point anchors */}
                          {points.map((p, idx) => (
                            <circle
                              key={idx}
                              cx={p.x}
                              cy={p.y}
                              r="5"
                              fill={p.d.color}
                              stroke="#ffffff"
                              strokeWidth="2"
                              className="cursor-pointer hover:scale-150 transition-transform"
                              onMouseEnter={() => setHoveredData(p.d)}
                              onMouseLeave={() => setHoveredData(null)}
                            />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              )}

            </div>

            {/* X-Axis labels */}
            <div className="flex justify-between items-center px-4 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium z-20">
              {chartData.map((d, idx) => (
                <span key={idx} className="w-[12%] text-center truncate font-bold">{d.label}</span>
              ))}
            </div>
          </div>
        )}

        {/* Hover Tooltip display */}
        {hoveredData && (
          <div className="absolute top-3 left-3 bg-zinc-950 text-zinc-50 text-right p-3 rounded-2xl shadow-xl border border-zinc-800 z-30 max-w-xs animate-fade-in text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-zinc-100">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredData.color }}></span>
              <span>{hoveredData.label}</span>
            </div>
            <div className="font-mono text-[11px] text-amber-400 font-semibold">
              المقدار المحقق: {hoveredData.value} {metric === 'hours' ? 'ساعة مذاكرة' : '% النتيجة المئوية'}
            </div>
            {hoveredData.details && (
              <p className="text-[10px] text-zinc-400 leading-normal">{hoveredData.details}</p>
            )}
          </div>
        )}
      </div>

      {/* Brief descriptive tip block */}
      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 text-right text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-2.5 leading-relaxed">
        <Info className="w-5 h-5 text-zinc-600 dark:text-zinc-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-zinc-800 dark:text-zinc-200 block">نصيحة لتحليل المجهود والدرجات:</strong>
          <span>
            وازن دائماً بين ساعات المذاكرة (مجهودك) ونسبة تحصيل درجات الامتحانات والواجبات. إذا لاحظت زيادة في ساعات مذاكرة مادة معينة مقابل تراجع درجاتها، ننصحك باستخدام روبوت المساعد الذكي لتزويدك بأساليب "الفهم الفعال والاستدعاء النشط" وتغيير نمط المراجعة الخاص بك فوراً.
          </span>
        </div>
      </div>

    </div>
  );
}
