import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Target,
  Calendar,
  Sparkles,
  BrainCircuit,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Lightbulb,
  Zap,
  RotateCcw,
  Compass,
  Flame,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import {
  computeTargetScore,
  fetchAITargetScorePrediction,
  TargetScorePrediction,
} from '../utils/targetScorePredictor';

export interface ScoreHistoryPoint {
  attempt: number;
  examTitle: string;
  score: number;
  level: string;
  date: string;
  timeSpent?: string;
}

interface ScoreProgressChartProps {
  history: ScoreHistoryPoint[];
  studentNickname: string;
  compact?: boolean;
  currentLevel?: string;
  commonMistakes?: string[];
  onOpenFlashcards?: () => void;
}

export const ScoreProgressChart: React.FC<ScoreProgressChartProps> = ({
  history,
  studentNickname,
  compact = false,
  currentLevel = 'Tân thủ',
  commonMistakes = [],
  onOpenFlashcards,
}) => {
  // Safe baseline history if empty
  const rawData: ScoreHistoryPoint[] =
    history.length > 0
      ? history
      : [
          {
            attempt: 1,
            examTitle: 'Bài kiểm tra đầu vào',
            score: 5.0,
            level: 'Nhập môn',
            date: 'Hôm nay',
            timeSpent: '45 phút',
          },
        ];

  // Target Score & AI Advice State
  const [prediction, setPrediction] = useState<TargetScorePrediction>(() =>
    computeTargetScore(rawData, commonMistakes)
  );
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Recalculate local prediction when history or mistakes change
  useEffect(() => {
    setPrediction(computeTargetScore(rawData, commonMistakes));
  }, [history, commonMistakes]);

  // Statistics
  const scores = rawData.map((d) => d.score);
  const highestScore = Math.max(...scores);
  const latestScore = scores[scores.length - 1];
  const firstScore = scores[0];
  const avgScore = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
  const progressDiff = Number((latestScore - firstScore).toFixed(2));
  const lastAttemptNum = rawData[rawData.length - 1].attempt;

  // Handle Live AI Gemini Consultation
  const handleConsultGeminiAI = async () => {
    try {
      setIsLoadingAi(true);
      setAiError(null);
      const res = await fetchAITargetScorePrediction(
        rawData,
        studentNickname,
        currentLevel,
        commonMistakes
      );
      setPrediction(res);
    } catch (err: any) {
      setAiError('Không thể kết nối AI Gemini, hệ thống đang dùng thuật toán dự đoán nội bộ.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Build Unified Chart Data including Projection Target point
  const chartData = [
    ...rawData.map((d, index) => {
      const isLast = index === rawData.length - 1;
      return {
        attempt: d.attempt,
        displayLabel: `Lần ${d.attempt}`,
        examTitle: d.examTitle,
        actualScore: d.score,
        // Bridge the projection line from the last actual point to the target point
        projectedScore: isLast ? d.score : null,
        level: d.level,
        date: d.date,
        timeSpent: d.timeSpent,
        isTarget: false,
      };
    }),
    {
      attempt: lastAttemptNum + 1,
      displayLabel: `Lần ${lastAttemptNum + 1} (Mục tiêu)`,
      examTitle: `🎯 Mục tiêu bứt phá (${prediction.targetScoreRange}đ)`,
      actualScore: null,
      projectedScore: prediction.targetScore,
      level:
        prediction.targetScore >= 8.0
          ? 'Đại cao thủ'
          : prediction.targetScore >= 7.0
          ? 'Cao thủ'
          : prediction.targetScore >= 5.0
          ? 'Đại sư'
          : 'Nhập môn',
      date: 'Lần thi tới',
      timeSpent: '90 phút',
      isTarget: true,
    },
  ];

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      const isTarget = p.isTarget;

      if (isTarget) {
        return (
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border-2 border-purple-500/80 text-xs space-y-2 max-w-xs animate-fade-in">
            <div className="font-bold text-purple-300 flex items-center justify-between gap-2 border-b border-purple-500/30 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-purple-400" />
                <span>MỤC TIÊU LẦN THI TỚI</span>
              </span>
              <span className="text-[10px] bg-purple-900/80 text-purple-200 px-1.5 py-0.5 rounded font-mono">
                {prediction.feasibilityPercent}% khả thi
              </span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-300">Điểm mục tiêu (Target):</span>
              <span className="text-base font-black text-amber-300">
                {prediction.targetScore.toFixed(1)} / 10
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Khoảng kỳ vọng:</span>
              <span className="font-semibold text-purple-200">{prediction.targetScoreRange}đ</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Đà tiến bộ:</span>
              <span className="font-bold text-emerald-400">{prediction.momentumStatus}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-700/80 text-[11px] text-slate-300 leading-snug">
              <span className="text-amber-400 font-bold">Trọng tâm AI: </span>
              {prediction.keyFocusAreas[0]?.topic}
            </div>
          </div>
        );
      }

      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 max-w-xs">
          <div className="font-bold text-blue-300 flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5">
            <span>Lần thi #{p.attempt}</span>
            <span className="text-[11px] text-slate-400 font-normal">{p.date}</span>
          </div>
          <div className="font-semibold text-slate-100 truncate">{p.examTitle}</div>
          <div className="flex items-center justify-between pt-1 text-slate-300">
            <span>Điểm đạt được:</span>
            <span className="text-base font-black text-amber-400">
              {p.actualScore !== null ? Number(p.actualScore).toFixed(2) : '--'} / 10
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Cấp độ:</span>
            <span className="font-bold text-emerald-400">{p.level}</span>
          </div>
          {p.timeSpent && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>Thời gian:</span>
              <span>{p.timeSpent}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Container 1: The Chart & Basic Stats */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-6">
        {/* Title & Quick Stats Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Biểu Đồ Tiến Bộ & Dự Đoán Điểm Số (Target Score)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                @{studentNickname}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dựa trên dữ liệu scoreHistory để phân tích đà tiến bộ và dự đoán điểm thi tiếp theo
            </p>
          </div>

          {/* Stat badges */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[10px]">Lần thi gần nhất</span>
              <span className="font-bold text-slate-800 text-sm">{latestScore.toFixed(2)}đ</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs">
              <span className="text-purple-600 font-bold block text-[10px] flex items-center gap-1">
                <Target className="w-3 h-3" /> Target lần tới
              </span>
              <span className="font-black text-purple-700 text-sm">
                {prediction.targetScore.toFixed(1)}đ
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[10px]">Điểm cao nhất</span>
              <span className="font-bold text-amber-600 text-sm">{highestScore.toFixed(2)}đ</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[10px]">Trung bình</span>
              <span className="font-bold text-blue-600 text-sm">{avgScore}đ</span>
            </div>
            {rawData.length > 1 && (
              <div
                className={`px-3 py-1.5 rounded-xl border text-xs ${
                  progressDiff >= 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <span className="block text-[10px] opacity-75">Tăng trưởng</span>
                <span className="font-bold text-sm">
                  {progressDiff >= 0 ? `+${progressDiff}` : progressDiff}đ
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Recharts Line Chart with Projection */}
        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              <XAxis
                dataKey="displayLabel"
                tick={{ fill: '#64748b', fontSize: 11 }}
                stroke="#cbd5e1"
              />

              <YAxis
                domain={[0, 10]}
                ticks={[0, 2, 3.5, 5, 7, 8, 10]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                stroke="#cbd5e1"
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Threshold Reference Lines for Ranks */}
              <ReferenceLine
                y={3.5}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: 'Nhập môn (3.5)',
                  position: 'insideBottomRight',
                  fill: '#d97706',
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={5.0}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{
                  value: 'Đại sư (5.0)',
                  position: 'insideBottomRight',
                  fill: '#059669',
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={7.0}
                stroke="#8b5cf6"
                strokeDasharray="4 4"
                label={{
                  value: 'Cao thủ (7.0)',
                  position: 'insideBottomRight',
                  fill: '#7c3aed',
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={8.0}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                label={{
                  value: 'Đại cao thủ (8.0)',
                  position: 'insideBottomRight',
                  fill: '#e11d48',
                  fontSize: 10,
                }}
              />

              {/* Dynamic Target Reference Line */}
              <ReferenceLine
                y={prediction.targetScore}
                stroke="#7c3aed"
                strokeDasharray="3 3"
                strokeWidth={2}
                label={{
                  value: `🎯 Mục tiêu: ${prediction.targetScore.toFixed(1)}đ`,
                  position: 'insideTopLeft',
                  fill: '#6d28d9',
                  fontSize: 11,
                  fontWeight: 'bold',
                }}
              />

              {/* Actual Score Line (Solid Blue) */}
              <Line
                type="monotone"
                dataKey="actualScore"
                name="Điểm thực tế"
                stroke="#2563eb"
                strokeWidth={3}
                connectNulls={false}
                activeDot={{ r: 8, stroke: '#1d4ed8', strokeWidth: 2, fill: '#fff' }}
                dot={{ r: 5, stroke: '#2563eb', strokeWidth: 2, fill: '#60a5fa' }}
              />

              {/* Projected Momentum Target Line (Dashed Purple) */}
              <Line
                type="monotone"
                dataKey="projectedScore"
                name="Dự đoán mục tiêu"
                stroke="#8b5cf6"
                strokeWidth={3}
                strokeDasharray="5 5"
                connectNulls={true}
                activeDot={{ r: 9, stroke: '#7c3aed', strokeWidth: 2, fill: '#f59e0b' }}
                dot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#a855f7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Level explanation footer */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-600 inline-block rounded-full" />
              <span className="font-medium text-slate-700">Điểm số thực tế</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-purple-600 inline-block border-b-2 border-dashed border-purple-600" />
              <span className="font-semibold text-purple-700">Dự đoán Target lần tới</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500 inline-block border-b border-dashed border-amber-500" />
              <span>3.5đ (Nhập môn)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500 inline-block border-b border-dashed border-emerald-500" />
              <span>5.0đ (Đại sư)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-purple-500 inline-block border-b border-dashed border-purple-500" />
              <span>7.0đ (Cao thủ)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500 inline-block border-b border-dashed border-rose-500" />
              <span>8.0đ (Đại cao thủ)</span>
            </span>
          </div>

          <span className="italic text-slate-400">
            * Phân tích tự động từ dữ liệu scoreHistory qua từng đề thi THPT
          </span>
        </div>
      </div>

      {/* Container 2: Target Score & AI Knowledge Advice Card (Yêu cầu trọng tâm của User) */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-500/40 shadow-xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-md">
              <Target className="w-3.5 h-3.5" />
              <span>Dự Đoán Điểm Số Mục Tiêu Dựa Trên Đà Tiến Bộ</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Mục Tiêu Lần Thi Tới & Lời Khuyên Trọng Tâm Của AI</span>
              {prediction.isAiLive && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live Gemini
                </span>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Dựa vào dữ liệu lịch sử {rawData.length} bài thi, AI phân tích tốc độ tăng trưởng điểm số và chỉ ra chính xác các chuyên đề Toán 12 bạn cần tập trung để đạt điểm mục tiêu.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleConsultGeminiAI}
              disabled={isLoadingAi}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-50"
              title="Kích hoạt AI Gemini 3.8 Flash phân tích sâu lộ trình"
            >
              {isLoadingAi ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI Đang Phân Tích...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Hỏi Cố Vấn AI Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>

        {aiError && (
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs">
            {aiError}
          </div>
        )}

        {/* Target Score & Momentum Spotlight Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Box 1: Target Score Hero */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <span className="font-semibold text-purple-300 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> Điểm Số Mục Tiêu (Target Score)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 font-mono">
                  {prediction.targetScoreRange}đ
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-amber-300 tracking-tight">
                  {prediction.targetScore.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-slate-400">/ 10 điểm</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Kỳ vọng bứt phá: <span className="font-bold text-emerald-400">{prediction.momentumScore}</span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
              <span>Độ khả thi mục tiêu:</span>
              <span className="font-bold text-amber-300">{prediction.feasibilityPercent}%</span>
            </div>
          </div>

          {/* Box 2: Momentum Progress Trend */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Đà Tiến Bộ Hiện Tại (Momentum)</span>
              </div>
              <div className="inline-block px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-sm mb-2.5">
                {prediction.momentumStatus}
              </div>
              <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-gradient-to-r from-blue-400 via-indigo-400 to-amber-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(20, prediction.feasibilityPercent))}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {prediction.progressAnalysis}
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Số bài đã tích lũy:</span>
              <span className="font-bold text-white">{rawData.length} bài thi</span>
            </div>
          </div>

          {/* Box 3: Tactical Advice */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                <span>Chiến Thuật Làm Bài 90 Phút</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed mb-3">
                {prediction.tacticalAdvice}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 text-[11px] text-amber-200/90 italic flex items-start gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
              <span>{prediction.motivationMessage}</span>
            </div>
          </div>
        </div>

        {/* Knowledge Areas to Focus on (Lời khuyên của AI về phần kiến thức cần tập trung) */}
        <div className="relative z-10 space-y-3.5 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-amber-400" />
              <span>Lời Khuyên AI: 3 Trọng Tâm Kiến Thức Cần Tập Trung Để Đạt Mục Tiêu</span>
            </h4>
            <span className="text-xs text-slate-400">
              Được lọc riêng theo mức điểm {latestScore.toFixed(1)}đ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prediction.keyFocusAreas.map((area, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all hover:border-indigo-400/50 flex flex-col justify-between space-y-3 shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-400/30">
                      {idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 text-right">
                      {area.importance}
                    </span>
                  </div>

                  <h5 className="font-bold text-white text-sm leading-snug mb-1.5">
                    {area.topic}
                  </h5>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    <span className="text-indigo-300 font-semibold">Lý do: </span>
                    {area.why}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-700/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Hành động cụ thể:
                    </span>
                    {area.recommendedActions.map((action, actionIdx) => (
                      <div
                        key={actionIdx}
                        className="flex items-start gap-1.5 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {onOpenFlashcards && (
                  <button
                    type="button"
                    onClick={onOpenFlashcards}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ôn Flashcard chuyên đề này</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
