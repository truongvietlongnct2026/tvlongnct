import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { StudentProfile, SPREADSHEET_ID } from '../services/googleWorkspace';
import { UnifiedExamItem } from './ExamList';
import { calculateLevelFromScore } from '../data/sampleExams';
import { ScoreProgressChart, ScoreHistoryPoint } from './ScoreProgressChart';
import { PrintableReportCard } from './PrintableReportCard';
import { exportElementToPdf } from '../utils/pdfExport';
import { fireSpectacularConfetti, playVictorySound } from '../utils/celebrationEffects';
import { AIExamGeneratorModal } from './AIExamGeneratorModal';
import { computeTargetScore } from '../utils/targetScorePredictor';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
  BrainCircuit,
  Zap,
  Download,
  FileDown,
  ShieldCheck,
  ShieldAlert,
  Lock,
  CreditCard,
  Target,
  Layers,
} from 'lucide-react';

export interface GradingResponseData {
  totalScore: number;
  level: string;
  summary: string;
  commonMistakes: string[];
  part1Results?: {
    questionNumber: number;
    studentAnswer?: string;
    correctAnswer: string;
    isCorrect: boolean;
    solution: string;
  }[];
  part2Results?: {
    questionNumber: number;
    items: { sub: string; studentAnswer: boolean | null; correctAnswer: boolean; isCorrect: boolean }[];
    correctCount: number;
    score: number;
    solution: string;
  }[];
  part3Results?: {
    questionNumber: number;
    studentAnswer?: string;
    correctAnswer: string;
    isCorrect: boolean;
    solution: string;
  }[];
  suggestedTopic?: string;
}

interface ExamResultProps {
  exam: UnifiedExamItem;
  student: StudentProfile;
  gradeData: GradingResponseData;
  timeSpentFormatted: string;
  sheetSyncSuccess: boolean;
  sheetSyncError: string | null;
  onRetrySheetSync: () => void;
  onBackToExamList: () => void;
  onStartPracticeExam: (practiceExam: UnifiedExamItem) => void;
  scoreHistory?: ScoreHistoryPoint[];
  isMockExam?: boolean;
  violationCount?: number;
  onOpenFlashcards?: () => void;
}

export const ExamResult: React.FC<ExamResultProps> = ({
  exam,
  student,
  gradeData,
  timeSpentFormatted,
  sheetSyncSuccess,
  sheetSyncError,
  onRetrySheetSync,
  onBackToExamList,
  onStartPracticeExam,
  scoreHistory = [],
  isMockExam = true,
  violationCount = 0,
  onOpenFlashcards,
}) => {
  const [expandedSection, setExpandedSection] = useState<'mistakes' | 'solutions' | 'all'>('mistakes');
  const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [isAIExamModalOpen, setIsAIExamModalOpen] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);
  const levelInfo = calculateLevelFromScore(gradeData.totalScore);

  // Compute Target Score for next exam based on scoreHistory and current score
  const targetPrediction = computeTargetScore(
    scoreHistory.length > 0
      ? scoreHistory
      : [
          {
            attempt: 1,
            examTitle: exam.title,
            score: gradeData.totalScore,
            level: levelInfo.level,
            date: 'Hôm nay',
            timeSpent: timeSpentFormatted,
          },
        ],
    gradeData.commonMistakes
  );

  // Handle Export to PDF
  const handleExportPdf = async () => {
    if (!reportRef.current) return;
    try {
      setIsExportingPdf(true);
      setPdfSuccessMessage(null);
      const safeExamTitle = exam.title.replace(/[^a-zA-Z0-9à-ỹÀ-Ỹ]/g, '_').slice(0, 25);
      const fileName = `KetQua_Toan12_${student.nickname}_${safeExamTitle}.pdf`;
      await exportElementToPdf(reportRef.current, fileName);
      setPdfSuccessMessage('Đã tải xuống file PDF báo cáo thành công!');
      setTimeout(() => setPdfSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('PDF export failed:', err);
      alert('Không thể xuất file PDF: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      fireSpectacularConfetti();
      if (gradeData.totalScore >= 7.0) {
        playVictorySound();
      }
    } catch (e) {
      // safe fallback
    }
  }, [gradeData.totalScore]);

  // Handle generating customized practice test with Gemini
  const handleGeneratePractice = async () => {
    try {
      setIsGeneratingPractice(true);
      setGenerateError(null);

      const targetTopic = gradeData.suggestedTopic || 'Tính đơn điệu và cực trị của hàm số';
      const res = await fetch('/api/generate-practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentNickname: student.nickname,
          score: gradeData.totalScore,
          level: levelInfo.level,
          topic: targetTopic,
          commonMistakes: gradeData.commonMistakes,
        }),
      });

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'Không nhận được dữ liệu đề thi từ Gemini');
      }

      const generatedData = json.data;
      // Convert to UnifiedExamItem
      const practiceItem: UnifiedExamItem = {
        id: `ai-practice-${Date.now()}`,
        title: generatedData.title || `Đề Ôn Luyện AI: ${targetTopic} (Mức ${gradeData.totalScore.toFixed(1)}đ)`,
        category: `Đề AI ôn tập mức độ ${levelInfo.level}`,
        source: 'ai_generated',
        durationMinutes: 90,
        questionCount: 22,
        builtInExam: {
          id: `ai-practice-${Date.now()}`,
          title: generatedData.title || `Đề Ôn Luyện AI: ${targetTopic}`,
          category: `Cá nhân hóa cho ${student.nickname}`,
          year: 2025,
          topic: targetTopic,
          part1: generatedData.part1 || [],
          part2: generatedData.part2 || [],
          part3: generatedData.part3 || [],
        },
      };

      onStartPracticeExam(practiceItem);
    } catch (err: any) {
      console.error('Error generating practice:', err);
      setGenerateError(err.message || 'Lỗi khi tạo đề ôn luyện');
    } finally {
      setIsGeneratingPractice(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Hero: Score & Level Badge */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-emerald-300 border border-white/10 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã hoàn thành bài kiểm tra
              </span>
              <span className="text-xs text-slate-300">
                Thí sinh: @{student.nickname} ({student.fullName})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {exam.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Thời gian làm bài: <span className="font-semibold text-white">{timeSpentFormatted}</span>
            </p>

            {/* Quick Action Buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isExportingPdf ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    <span>Đang khởi tạo PDF chuyên nghiệp...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    <span>Tải Báo Cáo & Biểu Đồ (PDF)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  fireSpectacularConfetti();
                  playVictorySound();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all cursor-pointer shadow-xs hover:scale-105"
                title="Bắn pháo hoa ăn mừng kết quả"
              >
                <span>🎉</span>
                <span>Bắn Pháo Hoa</span>
              </button>

              {onOpenFlashcards && (
                <button
                  type="button"
                  onClick={onOpenFlashcards}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all cursor-pointer shadow-xs hover:scale-105"
                  title="Mở sổ tay Flashcard để ôn lại công thức Toán 12"
                >
                  <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ôn Lại Flashcard</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsAIExamModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white border border-indigo-300/30 transition-all cursor-pointer shadow-md shadow-indigo-500/20 hover:scale-105"
                title="Yêu cầu AI tự động ra đề thi khác tương tự phù hợp mức điểm vừa rồi"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Ra Đề Khác (May Đo Riêng)</span>
              </button>

              {pdfSuccessMessage && (
                <span className="text-xs text-emerald-300 font-semibold animate-fade-in flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {pdfSuccessMessage}
                </span>
              )}
            </div>
          </div>

          {/* Score, Rank & Target Score Card */}
          <div className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/15">
            <div className="text-center pr-3 sm:pr-4 border-r border-white/20">
              <div className="text-xs text-slate-300 font-medium mb-0.5">Điểm số</div>
              <div className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
                {gradeData.totalScore.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400">Thang điểm 10.0</div>
            </div>

            <div className="text-center pr-3 sm:pr-4 border-r border-white/20 pl-1">
              <div className="text-2xl sm:text-3xl mb-0.5">{levelInfo.badge}</div>
              <div className="text-xs text-slate-300 font-medium">Cấp độ</div>
              <div className="text-xs sm:text-sm font-black text-white">{levelInfo.level}</div>
            </div>

            <div className="text-center pl-1">
              <div className="text-xs text-purple-200 font-medium mb-0.5 flex items-center justify-center gap-1">
                <Target className="w-3 h-3 text-purple-300" /> Target lần tới
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-300 tracking-tight">
                {targetPrediction.targetScore.toFixed(1)}
              </div>
              <div className="text-[10px] text-purple-200/80 font-mono">
                {targetPrediction.targetScoreRange}đ
              </div>
            </div>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-medium">
            <span>Bảng xếp cấp độ:</span>
            <span>{levelInfo.description}</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold">
            <div
              className={`p-1.5 rounded-lg border ${
                levelInfo.level === 'Tân thủ'
                  ? 'bg-amber-500 text-slate-900 border-amber-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              🥉 Tân thủ (&lt;3.5đ)
            </div>
            <div
              className={`p-1.5 rounded-lg border ${
                levelInfo.level === 'Nhập môn'
                  ? 'bg-blue-500 text-white border-blue-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              🥈 Nhập môn (3.5-5đ)
            </div>
            <div
              className={`p-1.5 rounded-lg border ${
                levelInfo.level === 'Đại sư'
                  ? 'bg-emerald-500 text-white border-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              🥇 Đại sư (5-7đ)
            </div>
            <div
              className={`p-1.5 rounded-lg border ${
                levelInfo.level === 'Cao thủ'
                  ? 'bg-purple-500 text-white border-purple-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              💎 Cao thủ (7-8đ)
            </div>
            <div
              className={`p-1.5 rounded-lg border ${
                levelInfo.level === 'Đại cao thủ'
                  ? 'bg-rose-500 text-white border-rose-300'
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              👑 Đại cao thủ (&gt;8đ)
            </div>
          </div>
        </div>
      </div>

      {/* Proctoring & Integrity Status Card */}
      {isMockExam ? (
        <div
          className={`p-5 rounded-2xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            violationCount === 0
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/80 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                violationCount === 0
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              }`}
            >
              {violationCount === 0 ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  {violationCount === 0
                    ? 'Chế độ thi thử nghiêm túc: Trung thực 100%'
                    : `Cảnh báo giám sát thi thử: Phát hiện ${violationCount} lần vi phạm rời tab`}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    violationCount === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {violationCount === 0 ? 'Hợp lệ & Chuẩn chỉ' : 'Có ghi nhận vi phạm'}
                </span>
              </div>
              <p className="text-xs opacity-85 mt-0.5">
                {violationCount === 0
                  ? 'Thí sinh tập trung hoàn toàn trong suốt thời gian làm bài, không chuyển tab trình duyệt hoặc thu nhỏ cửa sổ.'
                  : `Hệ thống ghi nhận thí sinh đã rời khỏi màn hình làm bài ${violationCount} lần trong 90 phút. Dữ liệu này đã được lưu vào báo cáo.`}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs font-semibold opacity-70">Thời lượng quy định</div>
            <div className="text-sm font-bold">90 Phút cố định</div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/70 text-blue-900 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-bold">Chế độ Luyện tập tự do:</span> Bài làm không áp dụng giới hạn khóa tab và cảnh báo giám sát rời màn hình.
          </div>
        </div>
      )}

      {/* Google Sheets Sync Card (Yêu cầu Bước 4) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              sheetSyncSuccess
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Tự động gửi kết quả về Google Sheets
              </h3>
              {sheetSyncSuccess ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Đã ghi nhận
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                  Đang đồng bộ
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Đã ghi nhận: Thời gian làm bài ({timeSpentFormatted}) • Số điểm ({gradeData.totalScore.toFixed(2)}) • Cấp độ ({levelInfo.level}) • Các sai lầm hay mắc phải.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <span>Mở Google Sheets</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          {!sheetSyncSuccess && (
            <button
              onClick={onRetrySheetSync}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Gửi lại
            </button>
          )}
        </div>
      </div>

      {/* Proctoring & Mock Exam Discipline Card */}
      {isMockExam && (
        <div
          className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            violationCount === 0
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-xs'
              : 'bg-rose-50/80 border-rose-200 text-rose-950 shadow-xs'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                violationCount === 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {violationCount === 0 ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">
                  Biên Bản Giám Thị Ảo: {violationCount === 0 ? 'Trung Thực 100%' : `${violationCount} Lần Vi Phạm Rời Tab`}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    violationCount === 0
                      ? 'bg-emerald-200 text-emerald-800'
                      : 'bg-rose-200 text-rose-800'
                  }`}
                >
                  {violationCount === 0 ? 'Nghiêm túc 100%' : 'Có vi phạm'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {violationCount === 0
                  ? 'Thí sinh tuân thủ 100% quy chế phòng thi thử 90 phút: Không chuyển tab, không thu nhỏ cửa sổ. Kết quả phản ánh chính xác thực lực chuẩn thi THPT.'
                  : `Hệ thống ghi nhận thí sinh đã ${violationCount} lần chuyển tab hoặc mất tiêu điểm cửa sổ làm bài. Số lần vi phạm đã được tự động lưu vào Google Sheets của giáo viên.`}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-[11px] font-mono font-bold text-slate-600 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200">
              Quy chế: Thi thử 90 phút cố định
            </span>
          </div>
        </div>
      )}

      {/* Biểu Đồ Tiến Bộ Điểm Số & Dự Đoán Target Score Kèm Lời Khuyên AI (Recharts) */}
      <ScoreProgressChart
        history={
          scoreHistory.length > 0
            ? scoreHistory
            : [
                {
                  attempt: 1,
                  examTitle: exam.title,
                  score: gradeData.totalScore,
                  level: levelInfo.level,
                  date: 'Hôm nay',
                  timeSpent: timeSpentFormatted,
                },
              ]
        }
        studentNickname={student.nickname}
        currentLevel={levelInfo.level}
        commonMistakes={gradeData.commonMistakes}
        onOpenFlashcards={onOpenFlashcards}
      />

      {/* AI Practice Generator Card (Yêu cầu Bước 5: Tự động ra đề thi khác phù hợp mức điểm) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white border-2 border-indigo-400/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Gemini Tự Động Ra Đề Thi Khác Chuẩn Cấu Trúc 2025</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Đề thi đề xuất cho mức <span className="text-amber-300">{gradeData.totalScore.toFixed(1)} điểm</span>: {gradeData.suggestedTopic || 'Khảo sát hàm số & Tính đơn điệu, cực trị'}
            </h3>

            <div className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed space-y-1">
              <p>
                Dựa trên điểm số <span className="font-bold text-amber-300">{gradeData.totalScore.toFixed(2)} điểm ({levelInfo.level})</span> bạn vừa đạt, AI đã hiệu chỉnh thuật toán để tự động tạo một đề thi mới với nội dung câu hỏi bám sát <strong>{gradeData.totalScore <= 5.0 ? 'mức độ Thông hiểu' : gradeData.totalScore <= 7.5 ? 'mức độ Vận dụng' : 'mức độ Vận dụng cao'}</strong>.
              </p>
              <p className="text-[11px] text-slate-300/90 italic">
                Ví dụ: Học sinh đạt {gradeData.totalScore <= 5.0 ? '5.0 điểm' : `${gradeData.totalScore.toFixed(1)} điểm`}, AI sẽ thiết kế các câu hỏi mức độ thông hiểu, khắc phục triệt để các sai lầm trong bài làm vừa rồi!
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
            <button
              onClick={() => setIsAIExamModalOpen(true)}
              className="w-full px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-400/25 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <BrainCircuit className="w-4 h-4 text-slate-950" />
              <span>Chọn Đề Thi Khác (Tùy Chỉnh Độ Khó)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleGeneratePractice}
              disabled={isGeneratingPractice}
              className="w-full px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingPractice ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang may đo đề thi tương tự...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Vào Thi Nhanh Đề Tương Tự (Độ Khó Tự Động)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {generateError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/20 border border-rose-400 text-xs text-rose-200">
            {generateError}
          </div>
        )}
      </div>

      {/* Phân tích lỗi sai hay mắc phải (Yêu cầu Bước 4) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Phân tích lỗi đúng, sai & sai lầm hay mắc phải
              </h3>
              <p className="text-xs text-slate-500">
                Được AI Gemini phân tích chi tiết dựa trên bài làm của học sinh
              </p>
            </div>
          </div>
        </div>

        {/* Summary note */}
        {gradeData.summary && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">Nhận xét tổng thể: </span>
            {gradeData.summary}
          </div>
        )}

        {/* Common Mistakes List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Các sai lầm cụ thể cần khắc phục:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gradeData.commonMistakes?.map((mistake, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-100 text-xs text-rose-900 flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {idx + 1}
                </span>
                <span className="leading-snug">{mistake}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Solutions Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Lời giải chi tiết từng câu hỏi
            </h3>
          </div>
        </div>

        {/* Part 1 detailed items */}
        {gradeData.part1Results && gradeData.part1Results.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Phần I. Trắc nghiệm khách quan (12 câu)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gradeData.part1Results.map((item) => (
                <div
                  key={item.questionNumber}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    item.isCorrect
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-rose-50/50 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Câu {item.questionNumber}
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                        item.isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.isCorrect ? '✓ Đúng (+0.25đ)' : '✗ Chưa chính xác'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Bạn chọn: <span className="font-bold">{item.studentAnswer || 'Chưa chọn'}</span> • Đáp án đúng: <span className="font-bold text-emerald-700">{item.correctAnswer}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 pt-1 border-t border-slate-200/60 leading-relaxed">
                    <span className="font-semibold text-blue-700">Giải thích: </span>
                    {item.solution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Part 2 detailed items */}
        {gradeData.part2Results && gradeData.part2Results.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              Phần 2. Trắc nghiệm đúng, sai (4 câu)
            </h4>
            <div className="space-y-3">
              {gradeData.part2Results.map((item) => (
                <div
                  key={item.questionNumber}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Câu {item.questionNumber} ({item.correctCount}/4 ý đúng • +{item.score}đ)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {item.items.map((sub) => (
                      <div
                        key={sub.sub}
                        className={`p-2 rounded-lg border text-[11px] ${
                          sub.isCorrect
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}
                      >
                        <span className="font-bold mr-1">Ý {sub.sub}):</span>
                        {sub.isCorrect ? '✓ Đúng' : `✗ Sai (Đ.Án: ${sub.correctAnswer ? 'Đúng' : 'Sai'})`}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-700 pt-1 border-t border-slate-200 leading-relaxed">
                    <span className="font-semibold text-indigo-700">Lời giải: </span>
                    {item.solution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Part 3 detailed items */}
        {gradeData.part3Results && gradeData.part3Results.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Phần 3. Trả lời ngắn (6 câu)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gradeData.part3Results.map((item) => (
                <div
                  key={item.questionNumber}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    item.isCorrect
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-rose-50/50 border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Câu {item.questionNumber}
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                        item.isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.isCorrect ? '✓ Đúng (+0.5đ)' : '✗ Chưa chính xác'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Bạn nhập: <span className="font-mono font-bold">{item.studentAnswer || 'Trống'}</span> • Đáp án chuẩn: <span className="font-mono font-bold text-emerald-700">{item.correctAnswer}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 pt-1 border-t border-slate-200/60 leading-relaxed">
                    <span className="font-semibold text-teal-700">Giải thích: </span>
                    {item.solution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onBackToExamList}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Quay lại danh sách đề thi</span>
          </button>

          <button
            onClick={() => setIsAIExamModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <BrainCircuit className="w-4 h-4 text-indigo-600" />
            <span>Chọn Đề Thi Khác Bằng AI</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Đang xuất PDF...' : 'Tải File PDF Báo Cáo'}</span>
          </button>

          <a
            href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:underline font-semibold"
          >
            <span>Bảng điểm Google Sheets</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* AI Exam Generator Modal (Ra đề may đo theo điểm số) */}
      <AIExamGeneratorModal
        isOpen={isAIExamModalOpen}
        onClose={() => setIsAIExamModalOpen(false)}
        student={student}
        lastScore={gradeData.totalScore}
        lastLevel={levelInfo.level}
        suggestedTopic={gradeData.suggestedTopic}
        commonMistakes={gradeData.commonMistakes}
        onStartExam={(examItem, isMock) => {
          onStartPracticeExam(examItem);
        }}
      />

      {/* Hidden high-res container for generating the professional PDF report */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none" aria-hidden="true">
        <PrintableReportCard
          ref={reportRef}
          exam={exam}
          student={student}
          gradeData={gradeData}
          timeSpentFormatted={timeSpentFormatted}
          scoreHistory={scoreHistory}
          isMockExam={isMockExam}
          violationCount={violationCount}
        />
      </div>
    </div>
  );
};
